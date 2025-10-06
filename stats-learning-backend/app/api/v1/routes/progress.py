'''
Progress Tracking Routes

Track user learning progress and analytics.
'''

from typing import Any, Optional, cast
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_active_user, get_optional_current_user
from app.models.user import User
from app.models.progress import UserProgress, ProgressStatus
from app.models.lesson import Lesson
from app.models.level import Level
from app.models.module import Module
from app.services.user_service import compute_user_progress_summary
from app.core.events import emit_user_progress, subscribe, unsubscribe, next_or_heartbeat
from app.core.config import settings
from app.core.security import verify_token
from starlette.responses import StreamingResponse

router = APIRouter()


@router.get("/ping")
async def _ping() -> Any:
    return {"status": "ok"}

@router.get("/dashboard")
async def get_progress_dashboard(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    '''
    Get user's learning progress dashboard using real per-user data.
    '''
    summary = compute_user_progress_summary(db, cast(int, current_user.id))
    return {
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "full_name": current_user.full_name
        },
        "overall_progress": summary,
        # Placeholder sections; can be populated from real content tables later
        "recent_activity": [],
        "world_progress": [],
        "next_lesson": None,
    }


@router.get("/summary")
async def get_progress_summary(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    '''
    Get user's progress summary for dashboard CTA logic.
    '''
    summary = compute_user_progress_summary(db, cast(int, current_user.id))
    
    # Determine if user has started learning
    has_started = summary.get("lessons_completed", 0) > 0 or len(
        db.query(UserProgress).filter(
            UserProgress.user_id == current_user.id,
            UserProgress.status.in_([ProgressStatus.STARTED, ProgressStatus.COMPLETED, ProgressStatus.MASTERED])  # type: ignore
        ).all()
    ) > 0
    
    # Get total lessons available (simple count for now)
    total_lessons = db.query(Lesson).count()
    
    return {
        "lessonsCompleted": summary.get("lessons_completed", 0),
        "totalLessons": total_lessons,
        "currentWorldId": None,  # Will implement when we have real content
        "currentLessonId": None,  # Will implement when we have real content
        "hasStarted": has_started,
        "totalXP": summary.get("total_xp", 0),
        "currentLevel": summary.get("current_level", 1),
        "currentStreak": summary.get("current_streak", 0),
    }


@router.get("/next")
async def get_next_step(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    '''
    Get the next actionable step for the user.
    Returns the next lesson/quiz/simulation or null if none.
    '''
    # Find the first lesson that's not completed/mastered in order
    # For now, we'll use a simple approach - find the first lesson with no progress or STARTED status
    progress_records = (
        db.query(UserProgress)
        .filter(UserProgress.user_id == current_user.id)
        .filter(UserProgress.lesson_id.isnot(None))
        .all()
    )
    
    # Create a map of lesson_id -> status
    progress_map = {p.lesson_id: p.status for p in progress_records}
    
    # Get all lessons in order by world/module/level ordering
    lessons = (
        db.query(Lesson, Level, Module)
        .join(Level, Lesson.level_id == Level.id)
        .join(Module, Level.module_id == Module.id)
        .order_by(Module.order_index, Level.order_index, Lesson.order_index)
        .all()
    )
    
    for lesson, level, module in lessons:
        status = progress_map.get(lesson.id)  # type: ignore
        if status is None or status == ProgressStatus.NEW:  # type: ignore
            # This is the next lesson to start
            return {
                "type": "lesson",
                "worldId": module.world_id,
                "lessonId": lesson.id,
                "title": lesson.title,
                "link": f"/worlds/{module.world_id}/lessons/{lesson.id}"
            }
        elif status == ProgressStatus.STARTED:  # type: ignore
            # Continue this lesson
            return {
                "type": "lesson", 
                "worldId": module.world_id,
                "lessonId": lesson.id,
                "title": lesson.title,
                "link": f"/worlds/{module.world_id}/lessons/{lesson.id}"
            }
    
    # If all lessons are completed, return null
    return None


@router.get("/stats")
async def get_learning_stats(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    '''
    Get detailed learning statistics and analytics.
    '''
    return {
        "user_id": current_user.id,
        "learning_stats": {
            "total_study_time_hours": 7.5,
            "average_session_minutes": 25,
            "lessons_per_week": 8,
            "accuracy_rate": 0.85,
            "favorite_topic": "Probability",
            "longest_streak": 12,
            "total_simulations_run": 45
        },
        "performance_trends": {
            "weekly_xp": [120, 150, 180, 200, 175, 160, 190],
            "accuracy_trend": [0.70, 0.75, 0.80, 0.82, 0.85, 0.83, 0.87],
            "time_spent_trend": [30, 25, 35, 40, 30, 25, 28]
        },
        "achievements": {
            "badges_earned": 8,
            "total_badges": 25,
            "latest_badge": {
                "code": "PROBABILITY_MASTER",
                "title": "Probability Master",
                "description": "Complete all probability basics lessons",
                "earned_at": "2025-09-23T17:00:00Z"
            }
        }
    }


@router.get("/lessons")
async def get_lessons_with_status(
    *,
    world_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Return all lessons (optionally within a world) with the current user's status for each.
    """
    q = db.query(Lesson)
    if world_id:
        q = (
            db.query(Lesson)
            .join(Level, Lesson.level_id == Level.id)
            .join(Module, Level.module_id == Module.id)
            .filter(Module.world_id == world_id)
            .order_by(Module.order_index, Level.order_index, Lesson.order_index)
        )
    lessons = q.all()

    # Map of lesson_id -> status for user
    up = db.query(UserProgress).filter(UserProgress.user_id == current_user.id).all()
    status_map = {p.lesson_id: p.status.name for p in up if p.lesson_id is not None}

    items = []
    for l in lessons:
        status = status_map.get(l.id, ProgressStatus.NEW.name)
        # Soft-lock: all lessons are accessible, but some may be read-only
        # Only mark as locked if user hasn't completed previous lessons
        is_locked = False
        if len(items) > 0:
            # Check if previous lesson was completed
            prev_lesson = items[-1]
            if prev_lesson["status"] not in (ProgressStatus.COMPLETED.name, ProgressStatus.MASTERED.name):
                is_locked = True
        
        items.append({
            "lesson_id": l.id,
            "title": l.title,
            "estimated_minutes": l.estimated_minutes,
            "status": status,
            "locked": is_locked,
        })

    return items


@router.get("/lesson/{lesson_id}")
async def get_lesson_detail(
    *,
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_current_user),
) -> Any:
    """Return a single lesson with current user's status and content."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).one_or_none()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    # Get user progress if user is logged in
    status_name = ProgressStatus.NEW.name
    if current_user:
        up = (
            db.query(UserProgress)
            .filter(UserProgress.user_id == current_user.id, UserProgress.lesson_id == lesson_id)
            .one_or_none()
        )
        status_name = (up.status.name if up is not None and up.status else ProgressStatus.NEW.name)  # type: ignore

    # Frontend expects `content_json` and `sim_config_json` keys
    return {
        "lesson_id": lesson.id,
        "title": lesson.title,
        "slug": lesson.slug,
        "estimated_minutes": lesson.estimated_minutes,
        "status": status_name,
        "learning_objectives": lesson.learning_objectives,
        "content_json": lesson.content_json or {},
        "sim_config_json": lesson.sim_config_json,
    }


@router.post("/lesson/{lesson_id}/start")
async def start_lesson(
    *,
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Mark a lesson as started.
    """
    # Ensure lesson exists and fetch its world context
    lesson = (
        db.query(Lesson, Level, Module)
        .join(Level, Lesson.level_id == Level.id)
        .join(Module, Level.module_id == Module.id)
        .filter(Lesson.id == lesson_id)
        .one_or_none()
    )
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
    lesson_obj, level_obj, module_obj = lesson
    world_id = module_obj.world_id

    # Soft-lock: allow starting any lesson, but track progress appropriately
    # No hard gating - lessons are accessible but may be read-only

    progress = (
        db.query(UserProgress)
        .filter(UserProgress.user_id == current_user.id, UserProgress.lesson_id == lesson_id)
        .one_or_none()
    )
    if progress is None:
        progress = UserProgress(user_id=current_user.id, lesson_id=lesson_id)
        db.add(progress)

    progress.status = ProgressStatus.STARTED
    db.commit()
    db.refresh(progress)

    summary = compute_user_progress_summary(db, cast(int, current_user.id))
    await emit_user_progress(cast(int, current_user.id), summary)  # type: ignore[arg-type]

    return {
        "message": "Lesson started",
        "lesson_id": lesson_id,
        "status": progress.status.name,
        "overall_progress": summary,
    }

@router.post("/lesson/{lesson_id}/complete")
async def complete_lesson(
    *,
    lesson_id: int,
    score: float,
    time_spent_seconds: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    '''
    Mark a lesson as completed and update progress (per-user persistence).
    '''
    # Find existing progress row or create one
    progress = (
        db.query(UserProgress)
        .filter(UserProgress.user_id == current_user.id, UserProgress.lesson_id == lesson_id)
        .one_or_none()
    )
    if progress is None:
        progress = UserProgress(user_id=current_user.id, lesson_id=lesson_id)
        db.add(progress)

    # Normalize incoming score to 0.0–1.0 scale (frontend may send 0–100)
    raw_score = float(score)
    normalized = raw_score / 100.0 if raw_score > 1.0 else raw_score
    # Clamp to [0.0, 1.0]
    normalized = max(0.0, min(1.0, normalized))

    setattr(progress, 'attempts_count', (progress.attempts_count or 0) + 1)  # type: ignore
    setattr(progress, 'last_score', normalized)  # type: ignore
    if progress.best_score is None or cast(float, progress.best_score) < normalized:  # type: ignore
        setattr(progress, 'best_score', normalized)  # type: ignore
    setattr(progress, 'time_spent_seconds', (progress.time_spent_seconds or 0) + max(0, int(time_spent_seconds)))  # type: ignore
    progress.status = ProgressStatus.COMPLETED if normalized >= 0.7 else ProgressStatus.STARTED

    db.commit()
    db.refresh(progress)

    summary = compute_user_progress_summary(db, cast(int, current_user.id))
    # Emit SSE update after commit
    await emit_user_progress(cast(int, current_user.id), summary)  # type: ignore[arg-type]
    xp_earned = 15 if normalized >= 0.8 else 10 if normalized >= 0.6 else 5

    return {
        "message": "Lesson completed successfully!",
        "lesson_id": lesson_id,
        "user_id": current_user.id,
        "score": normalized,
        "xp_earned": xp_earned,
        "time_spent_seconds": time_spent_seconds,
        "new_status": progress.status.name,
        "overall_progress": summary,
        "next_lesson": None,
    }
@router.post("/lesson-flow")
async def update_lesson_flow_progress(
    *,
    lessonSlug: str,
    progress: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Update lesson flow progress (viewedLesson, viewedSummary, quizAttempted)
    This is separate from the main lesson progress tracking
    """
    # For now, just return success - frontend uses localStorage
    # TODO: Store lesson flow progress in database if needed
    return {
        "message": "Lesson flow progress updated",
        "lessonSlug": lessonSlug,
        "progress": progress
    }

@router.get("/lesson-flow")
async def get_lesson_flow_progress(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Get all lesson flow progress for the current user
    """
    # For now, return empty - frontend uses localStorage
    # TODO: Retrieve lesson flow progress from database if needed
    return {}

@router.get("/events")
async def progress_events(token: str = Query(..., description="JWT as query for SSE")):
    payload = verify_token(token)
    if not payload or not payload.get("sub"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user_id = int(payload["sub"])
    q = await subscribe(user_id)

    async def gen():
        try:
            yield b":ok\n\n"
            while True:
                yield await next_or_heartbeat(q, 20.0)
        finally:
            await unsubscribe(user_id, q)

    return StreamingResponse(gen(), media_type="text/event-stream", headers={
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
    })
