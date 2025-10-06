'''
API Router Aggregator

Combines all API routers into a single router for inclusion in main app.
'''

from fastapi import APIRouter

# Import route modules
from app.api.v1.routes import auth, worlds, progress, gamification, simulations
from app.api.v1.routes import me

# Create main API router
api_router = APIRouter()

# API Info endpoint
@api_router.get("/", tags=["API Info"])
async def api_info():
    '''API information endpoint'''
    return {
        "message": "Statistics Learning App API v1",
        "status": "active", 
        "version": "1.0.0",
        "features": [
            "🔐 User Authentication & Registration",
            "📚 Learning Content Management", 
            "🎯 Progress Tracking & Analytics",
            "🏆 Gamification (XP, Badges, Streaks)",
            "📊 Interactive Statistics Simulations",
            "💾 PostgreSQL Database",
            "🔒 JWT Token Security"
        ],
        "endpoints": {
            "docs": "/docs",
            "health": "/health", 
            "auth": "/api/v1/auth/",
            "worlds": "/api/v1/worlds/",
            "progress": "/api/v1/progress/",
            "gamification": "/api/v1/gamification/",
            "simulations": "/api/v1/simulations/"
        }
    }

# Include routers (clean section below)

# TODO: Add other route imports when they are implemented
# from app.api.v1.routes import (
#     users, 
#     worlds,
#     lessons,
#     quiz,
#     progress,
#     simulation,
#     gamification,
#     admin
# )
#
# Include all sub-routers
# api_router.include_router(users.router, prefix="/users", tags=["Users"])
# api_router.include_router(worlds.router, prefix="/worlds", tags=["Content Catalog"])
# api_router.include_router(lessons.router, prefix="/lessons", tags=["Lessons"])
# api_router.include_router(quiz.router, prefix="/quiz", tags=["Quizzes"])
# api_router.include_router(progress.router, prefix="/progress", tags=["Progress"])
# api_router.include_router(simulation.router, prefix="/sim", tags=["Simulations"])
# api_router.include_router(gamification.router, prefix="/gamification", tags=["Gamification"])
# api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])

# Clean router includes (ensure stable tags and add /me)
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(worlds.router, prefix="/worlds", tags=["Learning Worlds"])
api_router.include_router(progress.router, prefix="/progress", tags=["Progress"])
api_router.include_router(gamification.router, prefix="/gamification", tags=["Gamification"])
api_router.include_router(simulations.router, prefix="/simulations", tags=["Simulations"])
api_router.include_router(me.router, tags=["Current User"])

# Import and include quiz router
from app.api.v1.routes import quiz
api_router.include_router(quiz.router, prefix="/quiz", tags=["Quizzes"])