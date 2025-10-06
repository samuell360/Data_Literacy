"""
Authentication service helpers for user initialization and management.
"""

from sqlalchemy.orm import Session
from app.models.user import User
from app.models.progress import UserProgress
from app.services.user_service import compute_user_progress_summary


def ensure_user_initialized(db: Session, user_id: int) -> None:
    """
    Ensure a user is properly initialized with default progress records.
    
    This is idempotent - calling multiple times won't create duplicates.
    Should be called after successful signup/login.
    """
    # Check if user already has any progress records
    existing_progress = db.query(UserProgress).filter(
        UserProgress.user_id == user_id
    ).first()
    
    if existing_progress:
        # User already initialized
        return
    
    # For now, we don't auto-create progress records since lessons
    # should be started explicitly by the user
    # This function is here for future expansion when we want to
    # automatically enroll users in starter content
    
    # We could add initial progress records here:
    # first_lesson = db.query(Lesson).order_by(Lesson.id).first()
    # if first_lesson:
    #     initial_progress = UserProgress(
    #         user_id=user_id,
    #         lesson_id=first_lesson.id,
    #         status=ProgressStatus.NEW
    #     )
    #     db.add(initial_progress)
    #     db.commit()
    
    pass


def bootstrap_new_user(db: Session, user: User) -> dict:
    """
    Bootstrap a newly registered user with initial state.
    
    Returns the user's initial progress summary.
    """
    ensure_user_initialized(db, user.id)
    
    # Return the user's progress summary (will be empty for new users)
    summary = compute_user_progress_summary(db, user.id)
    
    return {
        "user_id": user.id,
        "initialized": True,
        "progress_summary": summary
    }


def bootstrap_returning_user(db: Session, user: User) -> dict:
    """
    Bootstrap a returning user (login).
    
    Returns the user's current progress summary.
    """
    ensure_user_initialized(db, user.id)
    
    # Return the user's current progress
    summary = compute_user_progress_summary(db, user.id)
    
    return {
        "user_id": user.id,
        "returning": True,
        "progress_summary": summary
    }
