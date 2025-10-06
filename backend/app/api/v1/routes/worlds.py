'''
Learning Worlds Routes

Manage statistics learning worlds (major subject areas).
'''

from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_active_user, get_optional_current_user
from app.models.user import User
from app.models.world import World
from app.models.module import Module
from app.models.level import Level
from app.models.lesson import Lesson
from app.models.progress import UserProgress, ProgressStatus

router = APIRouter()


@router.get("/", response_model=List[dict])
async def get_worlds(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_current_user)
) -> Any:
    '''
    Get all available learning worlds.
    
    Returns all active learning worlds from the database.
    '''
    # Query actual worlds from database
    worlds = db.query(World).filter(World.is_active == True).order_by(World.order_index).all()
    
    result = []
    for world in worlds:
        # Count modules for this world
        modules_count = db.query(Module).filter(Module.world_id == world.id).count()
        
        # Determine user progress if authenticated
        user_progress = None
        if current_user:
            # Check if user has any progress in this world
            progress_exists = db.query(UserProgress).join(Lesson).join(Level).join(Module).filter(
                Module.world_id == world.id,
                UserProgress.user_id == current_user.id
            ).first()
            user_progress = "STARTED" if progress_exists else "NEW"
        
        result.append({
            "id": world.id,
            "title": world.title,
            "description": world.description,
            "icon": world.icon,
            "color": world.color,
            "difficulty_level": world.difficulty_level,
            "estimated_hours": world.estimated_hours,
            "is_active": world.is_active,
            "modules_count": modules_count,
            "user_progress": user_progress
        })
    
    return result


@router.get("/{world_id}")
async def get_world_details(
    *,
    world_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_current_user)
) -> Any:
    '''
    Get detailed information about a specific world with all its modules, levels, and lessons.
    '''
    world = db.query(World).filter(World.id == world_id).first()
    if not world:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="World not found"
        )
    
    # Get all modules for this world
    modules = db.query(Module).filter(Module.world_id == world_id).order_by(Module.order_index).all()
    
    modules_data = []
    total_lessons = 0
    completed_lessons = 0
    
    for module in modules:
        # Get levels for this module
        levels = db.query(Level).filter(Level.module_id == module.id).order_by(Level.order_index).all()
        
        levels_data = []
        for level in levels:
            # Get lessons for this level
            lessons = db.query(Lesson).filter(
                Lesson.level_id == level.id,
                Lesson.is_published == True
            ).order_by(Lesson.order_index).all()
            
            lessons_data = []
            for lesson in lessons:
                total_lessons += 1
                
                # Check if user has completed this lesson
                is_completed = False
                if current_user:
                    progress = db.query(UserProgress).filter(
                        UserProgress.user_id == current_user.id,
                        UserProgress.lesson_id == lesson.id,
                        UserProgress.status.in_([ProgressStatus.COMPLETED, ProgressStatus.MASTERED])  # type: ignore
                    ).first()
                    if progress:
                        is_completed = True
                        completed_lessons += 1
                
                lessons_data.append({
                    "id": lesson.id,
                    "title": lesson.title,
                    "slug": lesson.slug,
                    "estimated_minutes": lesson.estimated_minutes,
                    "xp_reward": lesson.xp_reward,
                    "order_index": lesson.order_index,
                    "is_completed": is_completed,
                    # Export lesson content and sim config so clients can render without extra calls
                    "content_json": lesson.content_json or {},
                    "sim_config_json": lesson.sim_config_json,
                })
            # Only include levels that have lessons
            if lessons_data:
                levels_data.append({
                    "id": level.id,
                    "title": level.title,
                    "difficulty": level.difficulty,
                    "order_index": level.order_index,
                    "unlock_xp": level.unlock_xp,
                    "lessons": lessons_data
                })
        
        # Only include modules that still have levels/lessons
        if levels_data:
            modules_data.append({
                "id": module.id,
                "title": module.title,
                "description": module.description,
                "order_index": module.order_index,
                "estimated_minutes": module.estimated_minutes,
                "levels": levels_data
            })
    
    # Calculate learning objectives from lesson data or use defaults
    learning_objectives = [
        f"Master the fundamentals of {world.title}",
        "Work through interactive lessons and simulations",
        "Build practical skills through hands-on practice",
        "Apply concepts to real-world scenarios"
    ]
    
    # Calculate user progress
    user_progress_data = None
    if current_user:
        completion_percentage = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
        
        # Get total XP earned in this world
        total_xp = db.query(UserProgress).join(Lesson).join(Level).join(Module).filter(
            Module.world_id == world_id,
            UserProgress.user_id == current_user.id,
            UserProgress.status.in_([ProgressStatus.COMPLETED, ProgressStatus.MASTERED])  # type: ignore
        ).count() * 20  # Approximate XP
        
        # Get time spent
        time_spent = db.query(UserProgress).join(Lesson).join(Level).join(Module).filter(
            Module.world_id == world_id,
            UserProgress.user_id == current_user.id
        ).all()
        total_time = sum((p.time_spent_seconds or 0) for p in time_spent) // 60
        
        user_progress_data = {
            "status": "STARTED" if completed_lessons > 0 else "NEW",
            "completion_percentage": round(completion_percentage, 1),
            "modules_completed": len([m for m in modules_data if all(
                lesson["is_completed"] for level in m["levels"] for lesson in level["lessons"]
            )]),
            "total_modules": len(modules_data),
            "xp_earned": total_xp,
            "time_spent_minutes": total_time
        }
    
    return {
        "id": world.id,
        "title": world.title,
        "description": world.description,
        "icon": world.icon,
        "color": world.color,
        "difficulty_level": world.difficulty_level,
        "estimated_hours": world.estimated_hours,
        "learning_objectives": learning_objectives,
        "modules": modules_data,
        "user_progress": user_progress_data
    }


@router.post("/{world_id}/start")
async def start_world(
    *,
    world_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    '''
    Start learning a world (returns first lesson).
    '''
    world = db.query(World).filter(World.id == world_id).first()
    if not world:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="World not found")
    
    # Find first lesson
    first_lesson = db.query(Lesson).join(Level).join(Module).filter(
        Module.world_id == world_id,
        Lesson.is_published == True
    ).order_by(Module.order_index, Level.order_index, Lesson.order_index).first()
    
    if not first_lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No lessons found in this world")
    
    return {
        "message": f"Started learning {world.title}",
        "world_id": world_id,
        "user_id": current_user.id,
        "status": "STARTED",
        "next_lesson": {
            "lesson_id": first_lesson.id,
            "title": first_lesson.title,
            "slug": first_lesson.slug
        }
    }


@router.get("/{world_id}/stats")
async def world_stats(
    *,
    world_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_current_user)
) -> Any:
    """Return basic world statistics derived from current data."""
    world = db.query(World).filter(World.id == world_id).one_or_none()
    if not world:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="World not found")

    # Lessons in world
    lessons_q = (
        db.query(Lesson.id, Lesson.estimated_minutes)
        .join(Level, Lesson.level_id == Level.id)
        .join(Module, Level.module_id == Module.id)
        .filter(Module.world_id == world_id)
    )
    lessons = lessons_q.all()
    total_lessons = len(lessons)
    total_minutes = sum(l.estimated_minutes or 0 for l in lessons)
    hours_total = round(total_minutes / 60, 1) if total_minutes else 0

    # Students: distinct users with any progress in this world's lessons
    user_ids = (
        db.query(UserProgress.user_id)
        .join(Lesson, UserProgress.lesson_id == Lesson.id)
        .join(Level, Lesson.level_id == Level.id)
        .join(Module, Level.module_id == Module.id)
        .filter(Module.world_id == world_id)
        .distinct()
        .all()
    )
    students_count = len(user_ids)

    return {
        "world_id": world_id,
        "title": world.title,
        "total_lessons": total_lessons,
        "hours_total": hours_total,
        "students": students_count,
        "reviews": None,  # Not stored yet
    }


@router.get("/{world_id}/resources")
async def world_resources(
    *,
    world_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_current_user)
) -> Any:
    """List resources for a world (placeholder until content exists)."""
    return []


@router.get("/{world_id}/projects")
async def world_projects(
    *,
    world_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_current_user)
) -> Any:
    """List projects for a world (placeholder until content exists)."""
    return []
