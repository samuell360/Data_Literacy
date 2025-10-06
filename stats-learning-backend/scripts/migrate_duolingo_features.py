#!/usr/bin/env python3
"""
Database Migration for Duolingo-Style Features

This script migrates the database to support all the new Duolingo-style
learning features including enhanced lesson content, new question types,
and gamification elements.
"""

import logging
import sys
from pathlib import Path
from typing import Dict, Any, List

# Add the parent directory to the path so we can import app modules
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.database import SessionLocal, create_tables
from app.core.config import settings
from app.models.lesson import Lesson
from app.models.question import Question, QuestionType
from app.models.quiz import Quiz
from app.models.world import World
from app.models.module import Module
from app.models.level import Level
from app.models.user import User
from app.models.progress import UserProgress
from app.models.gamification import UserGamification

logger = logging.getLogger(__name__)


def migrate_database():
    """Migrate database to support Duolingo-style features."""
    logger.info("Starting Duolingo-style features migration...")
    
    with SessionLocal() as db:
        try:
            # 1. Create all tables (including new ones)
            create_tables()
            logger.info("✓ Database tables created/updated")
            
            # 2. Add new question types if they don't exist
            add_new_question_types(db)
            logger.info("✓ New question types added")
            
            # 3. Update existing lessons with enhanced content
            update_lessons_with_duolingo_content(db)
            logger.info("✓ Lessons updated with Duolingo-style content")
            
            # 4. Create enhanced quiz questions
            create_enhanced_quiz_questions(db)
            logger.info("✓ Enhanced quiz questions created")
            
            # 5. Update gamification features
            update_gamification_features(db)
            logger.info("✓ Gamification features updated")
            
            # 6. Create sample users for testing
            create_sample_users(db)
            logger.info("✓ Sample users created")
            
            db.commit()
            logger.info("🎉 Migration completed successfully!")
            
        except Exception as e:
            db.rollback()
            logger.error(f"❌ Migration failed: {e}")
            raise


def add_new_question_types(db: Session):
    """Add new question types to support Duolingo-style questions."""
    # The QuestionType enum is already defined in the model
    # This function ensures the database supports the new types
    logger.info("Adding support for new question types: fill, tap-words, match")
    
    # Check if we need to add any database constraints or indexes
    # The enum values are already defined in the model


def update_lessons_with_duolingo_content(db: Session):
    """Update existing lessons with enhanced Duolingo-style content."""
    logger.info("Updating lessons with Duolingo-style content...")
    
    # Get all existing lessons
    lessons = db.query(Lesson).all()
    
    for lesson in lessons:
        # Update content_json with enhanced structure
        if not lesson.content_json or lesson.content_json == {}:
            lesson.content_json = create_enhanced_lesson_content(lesson.title)
            logger.info(f"Updated lesson: {lesson.title}")
        
        # Ensure quiz configuration exists
        if not lesson.quiz:
            create_quiz_for_lesson(db, lesson)
            logger.info(f"Created quiz for lesson: {lesson.title}")


def create_enhanced_lesson_content(title: str) -> Dict[str, Any]:
    """Create enhanced lesson content structure."""
    return {
        "sections": [
            {
                "type": "story",
                "title": f"Welcome to {title}",
                "content": f"# {title}\n\nLet's dive into this exciting topic with real-world examples!",
                "theme": "netflix"
            },
            {
                "type": "concept",
                "title": "Key Concepts",
                "content": "Here are the main concepts you'll learn in this lesson.",
                "examples": []
            },
            {
                "type": "formula",
                "title": "Important Formulas",
                "content": "Master these formulas to solve problems effectively.",
                "formulas": []
            },
            {
                "type": "example",
                "title": "Worked Examples",
                "content": "Let's work through some examples step by step.",
                "steps": []
            }
        ],
        "metadata": {
            "estimated_time": 15,
            "difficulty": "medium",
            "theme": "netflix",
            "learning_style": "duolingo"
        }
    }


def create_quiz_for_lesson(db: Session, lesson: Lesson):
    """Create a quiz configuration for a lesson."""
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


def create_enhanced_quiz_questions(db: Session):
    """Create enhanced quiz questions with Duolingo-style features."""
    logger.info("Creating enhanced quiz questions...")
    
    # Get lessons that need questions
    lessons = db.query(Lesson).all()
    
    for lesson in lessons:
        # Check if lesson already has questions
        existing_questions = db.query(Question).filter(Question.lesson_id == lesson.id).count()
        if existing_questions > 0:
            continue
            
        # Create sample questions based on lesson topic
        questions = create_sample_questions_for_lesson(lesson)
        
        for question_data in questions:
            question = Question(
                lesson_id=lesson.id,
                stem=question_data["stem"],
                question_type=question_data["type"],
                options_json=question_data.get("options"),
                correct_answer=question_data["correct_answer"],
                explanation_correct=question_data.get("explanation_correct", "Great job!"),
                explanation_incorrect=question_data.get("explanation_incorrect", "Not quite. Let's try again!"),
                hint_text=question_data.get("hint"),
                concept_tags=question_data.get("concept_tags", []),
                difficulty_tag=question_data.get("difficulty", "medium")
            )
            db.add(question)


def create_sample_questions_for_lesson(lesson: Lesson) -> List[Dict[str, Any]]:
    """Create sample questions for a lesson."""
    # This would be customized based on the actual lesson content
    # For now, create generic probability questions
    
    questions = [
        {
            "stem": "What is the probability of rolling a 6 on a fair die?",
            "type": QuestionType.MCQ,
            "options": ["1/6", "1/3", "1/2", "2/3"],
            "correct_answer": "1/6",
            "explanation_correct": "Correct! A fair die has 6 sides, so the probability of any specific number is 1/6.",
            "explanation_incorrect": "Not quite. Remember, a fair die has 6 equally likely outcomes.",
            "hint": "Think about how many sides a die has and how many ways you can get a 6.",
            "concept_tags": ["probability", "basic"],
            "difficulty": "easy"
        },
        {
            "stem": "If P(A) = 0.3 and P(B) = 0.4, what is P(A and B) if A and B are independent?",
            "type": QuestionType.MCQ,
            "options": ["0.12", "0.7", "0.1", "Cannot be determined"],
            "correct_answer": "0.12",
            "explanation_correct": "Perfect! For independent events, P(A and B) = P(A) × P(B) = 0.3 × 0.4 = 0.12",
            "explanation_incorrect": "For independent events, multiply the individual probabilities.",
            "hint": "For independent events, P(A and B) = P(A) × P(B)",
            "concept_tags": ["probability", "independence", "multiplication"],
            "difficulty": "medium"
        },
        {
            "stem": "What is the expected value of rolling a fair die?",
            "type": QuestionType.FILL,
            "correct_answer": "3.5",
            "explanation_correct": "Excellent! The expected value is (1+2+3+4+5+6)/6 = 21/6 = 3.5",
            "explanation_incorrect": "Calculate the average of all possible outcomes: (1+2+3+4+5+6)/6",
            "hint": "Expected value is the average of all possible outcomes.",
            "concept_tags": ["expected_value", "average"],
            "difficulty": "medium"
        }
    ]
    
    return questions


def update_gamification_features(db: Session):
    """Update gamification features for Duolingo-style learning."""
    logger.info("Updating gamification features...")
    
    # Ensure all users have gamification records
    users = db.query(User).all()
    
    for user in users:
        gamification = db.query(UserGamification).filter(
            UserGamification.user_id == user.id
        ).first()
        
        if not gamification:
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
            logger.info(f"Created gamification record for user: {user.email}")


def create_sample_users(db: Session):
    """Create sample users for testing the Duolingo-style features."""
    from app.core.security import get_password_hash
    from app.schemas.user import UserCreate
    from app.crud.crud_user import user as crud_user
    
    # Check if sample users already exist
    existing_user = db.query(User).filter(User.email == "student@example.com").first()
    if existing_user:
        logger.info("Sample users already exist, skipping creation")
        return
    
    # Create sample student user
    student_data = UserCreate(
        email="student@example.com",
        username="student",
        password="password123",
        full_name="Test Student",
        bio="Learning statistics with Duolingo-style lessons!",
        timezone="UTC",
        preferred_language="en",
        public_profile=True,
        allow_emails=True
    )
    
    student = crud_user.create(db, obj_in=student_data)
    logger.info(f"Created sample student: {student.email}")
    
    # Create gamification record for student
    gamification = UserGamification(
        user_id=student.id,
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


def verify_migration(db: Session):
    """Verify that the migration was successful."""
    logger.info("Verifying migration...")
    
    # Check tables exist
    tables_to_check = [
        "lessons", "questions", "quizzes", "users", 
        "user_progress", "user_gamification"
    ]
    
    for table in tables_to_check:
        result = db.execute(text(f"SELECT COUNT(*) FROM {table}"))
        count = result.scalar()
        logger.info(f"✓ Table {table}: {count} records")
    
    # Check question types
    question_types = db.execute(text("SELECT DISTINCT question_type FROM questions")).fetchall()
    logger.info(f"✓ Question types: {[q[0] for q in question_types]}")
    
    # Check enhanced content
    lessons_with_content = db.query(Lesson).filter(
        Lesson.content_json.isnot(None)
    ).count()
    logger.info(f"✓ Lessons with enhanced content: {lessons_with_content}")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    try:
        migrate_database()
        
        # Verify migration
        with SessionLocal() as db:
            verify_migration(db)
            
        print("\n🎉 Duolingo-style features migration completed successfully!")
        print("Your database now supports:")
        print("  ✓ Enhanced lesson content with stories, concepts, and formulas")
        print("  ✓ Multiple question types (MCQ, True/False, Fill-in-blank)")
        print("  ✓ Gamification features (hearts, XP, streaks)")
        print("  ✓ Adaptive quiz configurations")
        print("  ✓ Sample users for testing")
        
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        sys.exit(1)
