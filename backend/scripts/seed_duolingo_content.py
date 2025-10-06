#!/usr/bin/env python3
"""
Seed Database with Duolingo-Style Content

This script populates the database with comprehensive Duolingo-style
learning content including lessons, questions, and gamification data.
"""

import logging
import sys
from pathlib import Path
from typing import Dict, Any, List

# Add the parent directory to the path so we can import app modules
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.lesson import Lesson
from app.models.question import Question, QuestionType, DifficultyTag
from app.models.quiz import Quiz
from app.models.world import World
from app.models.module import Module
from app.models.level import Level
from app.models.user import User
from app.models.progress import UserProgress
from app.models.gamification import UserGamification
from app.schemas.user import UserCreate
from app.crud.crud_user import user as crud_user

logger = logging.getLogger(__name__)


def seed_database():
    """Seed the database with comprehensive Duolingo-style content."""
    logger.info("Starting database seeding with Duolingo-style content...")
    
    with SessionLocal() as db:
        try:
            # 1. Create worlds and modules
            create_learning_structure(db)
            logger.info("✓ Learning structure created")
            
            # 2. Create enhanced lessons
            create_enhanced_lessons(db)
            logger.info("✓ Enhanced lessons created")
            
            # 3. Create comprehensive quiz questions
            create_comprehensive_questions(db)
            logger.info("✓ Comprehensive questions created")
            
            # 4. Create sample users with progress
            create_sample_users_with_progress(db)
            logger.info("✓ Sample users with progress created")
            
            # 5. Create gamification data
            create_gamification_data(db)
            logger.info("✓ Gamification data created")
            
            db.commit()
            logger.info("🎉 Database seeding completed successfully!")
            
        except Exception as e:
            db.rollback()
            logger.error(f"❌ Seeding failed: {e}")
            raise


def create_learning_structure(db: Session):
    """Create the learning structure (worlds, modules, levels)."""
    logger.info("Creating learning structure...")
    
    # Get or create Probability World
    probability_world = db.query(World).filter(World.title == "Probability World").first()
    if not probability_world:
        probability_world = World(
            title="Probability World",
            description="Master the fundamentals of probability with real-world examples",
            icon="🎲",
            color="#E86AA6",
            is_active=True,
            order_index=1,
            difficulty_level=1,
            estimated_hours=5
        )
        db.add(probability_world)
        db.flush()  # Get the ID
    else:
        logger.info("Probability World already exists, using existing world")
    
    # Create modules
    modules_data = [
        {
            "title": "Basic Probability",
            "description": "Learn the fundamentals of probability theory",
            "learning_objectives": [
                "Understand what probability means",
                "Calculate basic probabilities",
                "Apply probability rules"
            ],
            "order_index": 1
        },
        {
            "title": "Random Variables",
            "description": "Explore discrete and continuous random variables",
            "learning_objectives": [
                "Define random variables",
                "Calculate expected values",
                "Understand variance and standard deviation"
            ],
            "order_index": 2
        },
        {
            "title": "Distributions",
            "description": "Master common probability distributions",
            "learning_objectives": [
                "Understand binomial distribution",
                "Apply normal distribution",
                "Use distribution properties"
            ],
            "order_index": 3
        }
    ]
    
    modules = []
    for module_data in modules_data:
        module = Module(
            world_id=probability_world.id,
            title=module_data["title"],
            description=module_data["description"],
            learning_objectives=module_data["learning_objectives"],
            order_index=module_data["order_index"],
            estimated_minutes=30
        )
        db.add(module)
        modules.append(module)
    
    db.flush()
    
    # Create levels for each module
    levels_data = [
        # Basic Probability levels
        {
            "module_idx": 0,
            "title": "What is Probability?",
            "difficulty": "rookie",
            "order_index": 1
        },
        {
            "module_idx": 0,
            "title": "Union and Intersection",
            "difficulty": "regular",
            "order_index": 2
        },
        {
            "module_idx": 0,
            "title": "Conditional Probability",
            "difficulty": "challenger",
            "order_index": 3
        },
        # Random Variables levels
        {
            "module_idx": 1,
            "title": "Discrete Random Variables",
            "difficulty": "rookie",
            "order_index": 1
        },
        {
            "module_idx": 1,
            "title": "Expected Value",
            "difficulty": "regular",
            "order_index": 2
        },
        # Distributions levels
        {
            "module_idx": 2,
            "title": "Binomial Distribution",
            "difficulty": "challenger",
            "order_index": 1
        }
    ]
    
    levels = []
    for level_data in levels_data:
        level = Level(
            module_id=modules[level_data["module_idx"]].id,
            title=level_data["title"],
            difficulty=level_data["difficulty"],
            order_index=level_data["order_index"],
            unlock_xp=level_data["order_index"] * 50
        )
        db.add(level)
        levels.append(level)
    
    db.flush()
    return levels


def create_enhanced_lessons(db: Session):
    """Create enhanced lessons with Duolingo-style content."""
    logger.info("Creating enhanced lessons...")
    
    levels = db.query(Level).all()
    
    lesson_templates = [
        {
            "title": "What is Probability?",
            "content": {
                "sections": [
                    {
                        "type": "story",
                        "title": "The Netflix Gamble",
                        "content": """
                        <h1 class="text-4xl font-bold mb-4">The Netflix Gamble 🎬</h1>
                        <p class="text-xl">
                        You're scrolling through Netflix deciding what to watch. Each show has a different 
                        "enjoyment score" and probability you'll actually finish it. How do you predict 
                        your average satisfaction?
                        </p>
                        <p class="text-lg mt-4">
                        Welcome to <strong>Expected Value</strong> - the math of making smart choices!
                        </p>
                        """,
                        "theme": "netflix"
                    },
                    {
                        "type": "concept",
                        "title": "What's a Random Variable?",
                        "content": """
                        <p class="text-lg mb-4">
                        A <strong>random variable (X)</strong> is just a number that depends on chance.
                        </p>
                        <div class="bg-blue-50 rounded-xl p-6 my-4">
                        <h4 class="font-bold text-blue-900 mb-2">Examples:</h4>
                        <ul class="space-y-2 text-gray-700">
                        <li>📱 <strong>X =</strong> number of TikTok likes on your next post</li>
                        <li>🎲 <strong>X =</strong> result of rolling a die (1, 2, 3, 4, 5, or 6)</li>
                        <li>🎮 <strong>X =</strong> coins earned in your next game match</li>
                        <li>☕ <strong>X =</strong> number of coffee orders at Starbucks in the next hour</li>
                        </ul>
                        </div>
                        """,
                        "theme": "netflix"
                    }
                ],
                "metadata": {
                    "estimated_time": 15,
                    "difficulty": "easy",
                    "theme": "netflix",
                    "learning_style": "duolingo"
                }
            },
            "learning_objectives": [
                "Understand what probability means",
                "Identify random variables in real life",
                "Calculate basic probabilities"
            ],
            "estimated_minutes": 15,
            "xp_reward": 20
        },
        {
            "title": "Discrete Random Variables & Expected Value",
            "content": {
                "sections": [
                    {
                        "type": "story",
                        "title": "The Uber Surge Challenge",
                        "content": """
                        <h1 class="text-4xl font-bold mb-4">The Uber Surge Challenge 🚗</h1>
                        <p class="text-xl">
                        You're trying to get home on a Friday night. Uber prices keep changing due to surge pricing. 
                        How much should you budget for your ride home?
                        </p>
                        <p class="text-lg mt-4">
                        Let's use <strong>Expected Value</strong> to make smart decisions!
                        </p>
                        """,
                        "theme": "netflix"
                    }
                ],
                "metadata": {
                    "estimated_time": 20,
                    "difficulty": "medium",
                    "theme": "netflix",
                    "learning_style": "duolingo"
                }
            },
            "learning_objectives": [
                "Define discrete random variables",
                "Calculate expected values",
                "Understand variance and standard deviation"
            ],
            "estimated_minutes": 20,
            "xp_reward": 25
        }
    ]
    
    for i, level in enumerate(levels):
        if i < len(lesson_templates):
            template = lesson_templates[i]
            
            lesson = Lesson(
                level_id=level.id,
                title=template["title"],
                slug=template["title"].lower().replace(" ", "-").replace("?", ""),
                learning_objectives=template["learning_objectives"],
                content_json=template["content"],
                estimated_minutes=template["estimated_minutes"],
                xp_reward=template["xp_reward"],
                is_published=True,
                order_index=1
            )
            db.add(lesson)
            db.flush()  # Get the lesson ID
            
            # Create quiz for the lesson
            quiz = Quiz(
                lesson_id=lesson.id,
                is_adaptive=True,
                min_questions=3,
                max_questions=8,
                pass_threshold=0.7,
                show_correct_answers=True,
                show_explanations=True,
                max_attempts=3,
                retry_delay_minutes=5
            )
            db.add(quiz)


def create_comprehensive_questions(db: Session):
    """Create comprehensive quiz questions with Duolingo-style features."""
    logger.info("Creating comprehensive questions...")
    
    lessons = db.query(Lesson).all()
    
    # Question templates for different topics
    question_templates = {
        "probability_basic": [
            {
                "stem": "You flip a fair coin. What's the probability of getting heads?",
                "type": QuestionType.MCQ,
                "options": ["1/2", "1/3", "2/3", "1/4"],
                "correct_answer": "1/2",
                "explanation_correct": "Perfect! A fair coin has two equally likely outcomes: heads or tails.",
                "explanation_incorrect": "Remember, a fair coin has two equally likely outcomes.",
                "hint_text": "A fair coin has two sides - heads and tails.",
                "scenario_text": "You're playing a coin-flipping game with friends.",
                "real_world_context": "This is the foundation of probability - equal likelihood!",
                "concept_tags": ["basic_probability", "fair_coin"],
                "difficulty_tag": DifficultyTag.EASY
            },
            {
                "stem": "What is the probability of rolling a 6 on a fair die?",
                "type": QuestionType.FILL,
                "correct_answer": "1/6",
                "explanation_correct": "Excellent! A fair die has 6 sides, so P(6) = 1/6.",
                "explanation_incorrect": "A fair die has 6 equally likely outcomes.",
                "hint_text": "How many sides does a die have?",
                "scenario_text": "You're playing a board game and need to roll a 6 to win.",
                "real_world_context": "This principle applies to any fair game with equal outcomes!",
                "concept_tags": ["basic_probability", "fair_die"],
                "difficulty_tag": DifficultyTag.EASY
            }
        ],
        "random_variables": [
            {
                "stem": "Your TikTok video gets 0 likes (p=0.3), 10 likes (p=0.5), or 100 likes (p=0.2). What's the expected number of likes?",
                "type": QuestionType.MCQ,
                "options": ["25", "30", "35", "40"],
                "correct_answer": "25",
                "explanation_correct": "Great! E[X] = (0)(0.3) + (10)(0.5) + (100)(0.2) = 0 + 5 + 20 = 25",
                "explanation_incorrect": "Calculate: multiply each outcome by its probability, then add them up.",
                "hint_text": "Expected value = sum of (outcome × probability)",
                "scenario_text": "You're trying to predict your average TikTok performance.",
                "real_world_context": "This helps content creators set realistic expectations!",
                "concept_tags": ["expected_value", "discrete_rv"],
                "difficulty_tag": DifficultyTag.MEDIUM
            },
            {
                "stem": "If the variance of X is 4, what is the standard deviation?",
                "type": QuestionType.FILL,
                "correct_answer": "2",
                "explanation_correct": "Perfect! Standard deviation = √variance = √4 = 2",
                "explanation_incorrect": "Standard deviation is the square root of variance.",
                "hint_text": "Standard deviation = √variance",
                "scenario_text": "You're analyzing the consistency of your daily coffee spending.",
                "real_world_context": "Lower standard deviation means more predictable spending!",
                "concept_tags": ["variance", "standard_deviation"],
                "difficulty_tag": DifficultyTag.MEDIUM
            }
        ],
        "binomial": [
            {
                "stem": "You shoot 10 free throws with 70% accuracy. What's the probability of making exactly 7?",
                "type": QuestionType.MCQ,
                "options": ["0.267", "0.350", "0.200", "0.150"],
                "correct_answer": "0.267",
                "explanation_correct": "Excellent! This is a binomial problem: C(10,7) × (0.7)⁷ × (0.3)³ ≈ 0.267",
                "explanation_incorrect": "Use the binomial formula: C(n,k) × p^k × (1-p)^(n-k)",
                "hint_text": "This is a binomial distribution problem with n=10, k=7, p=0.7",
                "scenario_text": "You're practicing basketball and want to know your chances of success.",
                "real_world_context": "Athletes use this to set realistic practice goals!",
                "concept_tags": ["binomial", "combinations"],
                "difficulty_tag": DifficultyTag.HARD
            }
        ]
    }
    
    # Assign questions to lessons
    for i, lesson in enumerate(lessons):
        if "probability" in lesson.title.lower():
            questions = question_templates["probability_basic"]
        elif "random" in lesson.title.lower():
            questions = question_templates["random_variables"]
        elif "binomial" in lesson.title.lower():
            questions = question_templates["binomial"]
        else:
            questions = question_templates["probability_basic"]
        
        for j, q_data in enumerate(questions):
            question = Question(
                lesson_id=lesson.id,
                stem=q_data["stem"],
                question_type=q_data["type"],
                options_json=q_data.get("options"),
                correct_answer=q_data["correct_answer"],
                explanation_correct=q_data["explanation_correct"],
                explanation_incorrect=q_data["explanation_incorrect"],
                hint_text=q_data["hint_text"],
                scenario_text=q_data["scenario_text"],
                real_world_context=q_data["real_world_context"],
                concept_tags=q_data["concept_tags"],
                difficulty_tag=q_data["difficulty_tag"],
                learning_objectives=[f"Master {concept}" for concept in q_data["concept_tags"]],
                prerequisite_concepts=[]
            )
            db.add(question)


def create_sample_users_with_progress(db: Session):
    """Create sample users with learning progress."""
    logger.info("Creating sample users with progress...")
    
    # Create sample student
    student_data = UserCreate(
        email="student@example.com",
        username="student",
        password="password123",
        full_name="Alex Student",
        bio="Learning statistics with Duolingo-style lessons!",
        timezone="UTC",
        preferred_language="en",
        public_profile=True,
        allow_emails=True
    )
    
    student = crud_user.create(db, obj_in=student_data)
    
    # Create gamification record
    gamification = UserGamification(
        user_id=student.id,
        total_xp=150,
        current_streak=3,
        longest_streak=7,
        hearts=5,
        max_hearts=5,
        level=2,
        badges=["first_lesson", "streak_3"],
        achievements=["completed_probability_basics"]
    )
    db.add(gamification)
    
    # Create progress for some lessons
    lessons = db.query(Lesson).limit(3).all()
    for i, lesson in enumerate(lessons):
        progress = UserProgress(
            user_id=student.id,
            world_id=lesson.level.module.world_id,
            module_id=lesson.level.module_id,
            level_id=lesson.level_id,
            lesson_id=lesson.id,
            status="COMPLETED" if i < 2 else "STARTED",
            best_score=85 if i < 2 else None,
            last_score=85 if i < 2 else None,
            attempts_count=1 if i < 2 else 0,
            time_spent_seconds=900 if i < 2 else 0
        )
        db.add(progress)


def create_gamification_data(db: Session):
    """Create additional gamification data."""
    logger.info("Creating gamification data...")
    
    # This would include badges, achievements, leaderboards, etc.
    # For now, we'll just ensure all users have gamification records
    
    users = db.query(User).all()
    for user in users:
        existing = db.query(UserGamification).filter(
            UserGamification.user_id == user.id
        ).first()
        
        if not existing:
            gamification = UserGamification(
                user_id=user.id,
                total_xp=0,
                current_streak=0,
                longest_streak=0,
                hearts=5,
                max_hearts=5,
                level=1,
                badges=[],
                achievements=[]
            )
            db.add(gamification)


def verify_seeding(db: Session):
    """Verify that the seeding was successful."""
    logger.info("Verifying seeding...")
    
    # Check counts
    worlds_count = db.query(World).count()
    modules_count = db.query(Module).count()
    levels_count = db.query(Level).count()
    lessons_count = db.query(Lesson).count()
    questions_count = db.query(Question).count()
    users_count = db.query(User).count()
    
    logger.info(f"✓ Worlds: {worlds_count}")
    logger.info(f"✓ Modules: {modules_count}")
    logger.info(f"✓ Levels: {levels_count}")
    logger.info(f"✓ Lessons: {lessons_count}")
    logger.info(f"✓ Questions: {questions_count}")
    logger.info(f"✓ Users: {users_count}")
    
    # Check question types
    question_types = db.execute(
        "SELECT DISTINCT question_type FROM questions"
    ).fetchall()
    logger.info(f"✓ Question types: {[q[0] for q in question_types]}")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    try:
        seed_database()
        
        # Verify seeding
        with SessionLocal() as db:
            verify_seeding(db)
            
        print("\n🎉 Database seeding completed successfully!")
        print("Your database now contains:")
        print("  ✓ Complete learning structure (worlds, modules, levels)")
        print("  ✓ Enhanced lessons with Duolingo-style content")
        print("  ✓ Comprehensive quiz questions with real-world scenarios")
        print("  ✓ Sample users with learning progress")
        print("  ✓ Gamification data and achievements")
        print("\nYou can now start the application and begin learning!")
        
    except Exception as e:
        logger.error(f"Seeding failed: {e}")
        sys.exit(1)
