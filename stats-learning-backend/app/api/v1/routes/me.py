'''
Current user endpoint returning user profile and aggregated progress.
'''

from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.schemas.user import UserResponse
from app.services.user_service import compute_user_progress_summary


router = APIRouter()


@router.get("/me")
async def get_me(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    summary = compute_user_progress_summary(db, current_user.id)
    return {
        "user": UserResponse.model_validate(current_user),
        "progress": summary,
    }

