"""
User service helpers for aggregating per-user progress.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Dict

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.progress import UserProgress, ProgressStatus


def _today_utc() -> datetime:
    return datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)


def compute_user_progress_summary(db: Session, user_id: int) -> Dict[str, Any]:
    """
    Build an aggregated progress snapshot for the given user from SQL.

    Returns a dict under keys that the frontend expects on /progress/dashboard:
    - lessons_completed
    - total_xp (naive: xp = attempts*1 + completed*10 + mastered*20)
    - current_level (naive level curve from XP)
    - level_xp, next_level_xp
    - current_streak (consecutive days with activity based on updated_at)
    - avg_score (average of best_score over completed items)
    - total_simulations_run
    - week_activity: list[bool] for last 7 days activity
    """
    # Base query for this user's progress
    q = select(UserProgress).where(UserProgress.user_id == user_id)
    rows = db.execute(q).scalars().all()

    lessons_completed = sum(1 for r in rows if r.status in {ProgressStatus.COMPLETED, ProgressStatus.MASTERED})
    attempts = sum(r.attempts_count or 0 for r in rows)
    mastered = sum(1 for r in rows if r.status == ProgressStatus.MASTERED)

    # XP heuristic
    total_xp = attempts + lessons_completed * 10 + mastered * 20 + sum(r.simulations_run or 0 for r in rows)

    # Simple level curve: every 300 XP is a level
    level_size = 300
    current_level = max(1, total_xp // level_size + 1)
    level_xp = (current_level - 1) * level_size
    next_level_xp = current_level * level_size

    # Average score
    scored = [r.best_score for r in rows if r.best_score is not None]
    avg_score = (sum(scored) / len(scored)) if scored else 0.0

    total_simulations_run = sum(r.simulations_run or 0 for r in rows)

    # Streak and week activity from updated_at
    today = _today_utc()
    last7 = [today - timedelta(days=i) for i in range(6, -1, -1)]
    day_has_activity = set(dt.date() for dt in (r.updated_at or r.created_at for r in rows))
    week_activity = [d.date() in day_has_activity for d in last7]

    # Compute current streak backwards from today
    streak = 0
    d = today
    while (d.date() in day_has_activity):
        streak += 1
        d = d - timedelta(days=1)

    return {
        "lessons_completed": lessons_completed,
        "total_xp": int(total_xp),
        "current_level": int(current_level),
        "level_xp": int(level_xp),
        "next_level_xp": int(next_level_xp),
        "current_streak": int(streak),
        "avg_score": float(avg_score),
        "total_simulations_run": int(total_simulations_run),
        "week_activity": week_activity,
    }

