'''
Statistics Simulation Routes

Interactive simulations for learning statistics concepts.
'''

import random
from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_active_user, get_optional_current_user
from app.models.user import User

router = APIRouter()


@router.get("/available")
async def get_available_simulations(
    *,
    world_id: int = None,
    current_user: User = Depends(get_optional_current_user)
) -> Any:
    '''
    Get list of available statistics simulations.
    '''
    simulations = [
        {
            "id": 1,
            "title": "Coin Flip Probability",
            "description": "Explore probability with virtual coin flips",
            "category": "Basic Probability",
            "difficulty": "Beginner",
            "estimated_minutes": 10,
            "icon": "🪙",
            "world_id": 1,
            "is_unlocked": True
        },
        {
            "id": 2,
            "title": "Central Limit Theorem",
            "description": "See how sample means become normal",
            "category": "Sampling Distributions",
            "difficulty": "Intermediate", 
            "estimated_minutes": 15,
            "icon": "📊",
            "world_id": 2,
            "is_unlocked": current_user is not None
        },
        {
            "id": 3,
            "title": "Hypothesis Testing",
            "description": "Interactive p-value and significance testing",
            "category": "Statistical Inference",
            "difficulty": "Advanced",
            "estimated_minutes": 20,
            "icon": "🧪",
            "world_id": 2,
            "is_unlocked": False
        },
        {
            "id": 4,
            "title": "Confidence Intervals",
            "description": "Build and interpret confidence intervals",
            "category": "Statistical Inference",
            "difficulty": "Intermediate",
            "estimated_minutes": 12,
            "icon": "📏",
            "world_id": 2,
            "is_unlocked": current_user is not None
        }
    ]
    
    if world_id:
        simulations = [s for s in simulations if s["world_id"] == world_id]
    
    return {
        "simulations": simulations,
        "total_available": len(simulations),
        "user_unlocked": len([s for s in simulations if s["is_unlocked"]]) if current_user else 0
    }


@router.post("/run/{simulation_id}")
async def run_simulation(
    *,
    simulation_id: int,
    parameters: dict,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    '''
    Run a statistics simulation with given parameters.
    '''
    if simulation_id == 1:  # Coin Flip Simulation
        num_flips = min(parameters.get("num_flips", 100), 10000)
        
        # Simulate coin flips
        flips = [random.choice(["H", "T"]) for _ in range(num_flips)]
        heads_count = flips.count("H")
        heads_percentage = (heads_count / num_flips) * 100
        
        return {
            "simulation_id": 1,
            "title": "Coin Flip Probability",
            "parameters": {"num_flips": num_flips},
            "results": {
                "total_flips": num_flips,
                "heads": heads_count,
                "tails": num_flips - heads_count,
                "heads_percentage": round(heads_percentage, 2),
                "expected_percentage": 50.0,
                "deviation": round(abs(heads_percentage - 50.0), 2)
            },
            "insights": [
                f"You flipped {heads_count} heads out of {num_flips} flips",
                f"That's {heads_percentage:.1f}% heads vs expected 50%",
                "The more flips you do, the closer you get to 50%" if num_flips < 1000 else "Great! You can see the law of large numbers in action!"
            ],
            "xp_earned": 5,
            "next_simulation": {
                "id": 2,
                "title": "Try the Central Limit Theorem simulation",
                "unlock_tip": "Complete 3 probability lessons to unlock"
            }
        }
    
    elif simulation_id == 2:  # Central Limit Theorem
        sample_size = min(parameters.get("sample_size", 30), 1000)
        num_samples = min(parameters.get("num_samples", 100), 5000)
        
        # Simulate CLT (using uniform distribution)
        sample_means = []
        for _ in range(num_samples):
            sample = [random.uniform(0, 10) for _ in range(sample_size)]
            sample_means.append(sum(sample) / len(sample))
        
        overall_mean = sum(sample_means) / len(sample_means)
        
        return {
            "simulation_id": 2,
            "title": "Central Limit Theorem",
            "parameters": {
                "sample_size": sample_size,
                "num_samples": num_samples,
                "population": "Uniform(0,10)"
            },
            "results": {
                "sample_means": sample_means[:50],  # First 50 for display
                "overall_mean": round(overall_mean, 3),
                "expected_mean": 5.0,
                "standard_error": round(2.887 / (sample_size ** 0.5), 3),
                "distribution_shape": "approximately normal"
            },
            "insights": [
                f"Generated {num_samples} sample means from samples of size {sample_size}",
                f"Sample means average: {overall_mean:.2f} (expected: 5.0)",
                "The sample means form a normal distribution!",
                "This demonstrates the Central Limit Theorem"
            ],
            "xp_earned": 10
        }
    
    else:
        return {
            "error": "Simulation not implemented yet",
            "available_simulations": [1, 2],
            "message": "Try simulation 1 (Coin Flip) or 2 (Central Limit Theorem)"
        }


@router.get("/history")
async def get_simulation_history(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    '''
    Get user's simulation history and statistics.
    '''
    return {
        "user_id": current_user.id,
        "total_simulations_run": 47,
        "favorite_simulation": "Central Limit Theorem",
        "total_xp_from_sims": 235,
        "recent_simulations": [
            {
                "simulation_id": 2,
                "title": "Central Limit Theorem",
                "run_at": "2025-09-23T18:45:00Z",
                "parameters": {"sample_size": 50, "num_samples": 200},
                "xp_earned": 10
            },
            {
                "simulation_id": 1,
                "title": "Coin Flip Probability",
                "run_at": "2025-09-23T18:30:00Z", 
                "parameters": {"num_flips": 1000},
                "xp_earned": 5
            }
        ],
        "achievements": [
            {
                "title": "Simulation Enthusiast",
                "description": "Run 25+ simulations",
                "earned": True
            },
            {
                "title": "CLT Master",
                "description": "Run Central Limit Theorem 10 times",
                "earned": True
            }
        ]
    }
