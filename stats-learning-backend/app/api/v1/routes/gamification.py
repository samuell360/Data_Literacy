'''
Gamification Routes

XP, badges, streaks, and leaderboards to motivate learning.
'''

from typing import Any, List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.user import User

router = APIRouter()


@router.get("/profile")
async def get_gamification_profile(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    '''
    Get user's gamification profile (XP, level, badges, streaks).
    '''
    return {
        "user_id": current_user.id,
        "username": current_user.username,
        "gamification": {
            "level": 5,
            "total_xp": 1250,
            "xp_to_next_level": 350,
            "current_streak": 8,
            "longest_streak": 23,
            "rank": "Statistics Apprentice"
        },
        "xp_breakdown": {
            "probability_basics": 450,
            "statistical_inference": 300,
            "data_visualization": 250,
            "experimental_design": 250
        },
        "recent_badges": [
            {
                "code": "FIRST_STEPS",
                "title": "First Steps",
                "description": "Complete your first lesson",
                "icon": "👶",
                "earned_at": "2025-09-23T16:00:00Z"
            },
            {
                "code": "PROBABILITY_BASICS",
                "title": "Probability Master",
                "description": "Complete Probability Basics world",
                "icon": "🎲",
                "earned_at": "2025-09-23T17:30:00Z"
            }
        ],
        "total_badges": 8,
        "available_badges": 25
    }


@router.get("/leaderboard")
async def get_leaderboard(
    *,
    world_id: Optional[int] = None,
    period: str = "weekly",  # daily, weekly, monthly, all-time
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    '''
    Get leaderboard for XP rankings.
    '''
    # Sample leaderboard data
    leaderboard_data = [
        {
            "rank": 1,
            "user_id": 5,
            "username": "StatsMaster",
            "xp": 2450,
            "level": 8,
            "badge_count": 15,
            "is_current_user": False
        },
        {
            "rank": 2,
            "user_id": 12,
            "username": "DataNinja",
            "xp": 2100,
            "level": 7,
            "badge_count": 12,
            "is_current_user": False
        },
        {
            "rank": 3,
            "user_id": current_user.id,
            "username": current_user.username,
            "xp": 1250,
            "level": 5,
            "badge_count": 8,
            "is_current_user": True
        },
        {
            "rank": 4,
            "user_id": 8,
            "username": "ProbabilityPro",
            "xp": 980,
            "level": 4,
            "badge_count": 6,
            "is_current_user": False
        }
    ]
    
    return {
        "period": period,
        "world_id": world_id,
        "world_title": "Probability Basics" if world_id == 1 else "All Worlds",
        "updated_at": "2025-09-23T19:00:00Z",
        "current_user_rank": 3,
        "total_participants": 156,
        "leaderboard": leaderboard_data
    }


@router.post("/award-xp")
async def award_xp(
    *,
    xp_amount: int,
    reason: str,
    world_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    '''
    Award XP to the current user.
    '''
    new_total_xp = 1250 + xp_amount  # Simulate current XP + new XP
    
    return {
        "message": f"Awarded {xp_amount} XP!",
        "reason": reason,
        "xp_awarded": xp_amount,
        "total_xp": new_total_xp,
        "level_before": 5,
        "level_after": 5 if new_total_xp < 1500 else 6,
        "level_up": new_total_xp >= 1500,
        "world_id": world_id,
        "badges_unlocked": [
            {
                "code": "XP_COLLECTOR",
                "title": "XP Collector", 
                "description": "Earn 1000+ XP"
            }
        ] if new_total_xp >= 1500 else []
    }
