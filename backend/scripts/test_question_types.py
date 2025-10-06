#!/usr/bin/env python3
"""
Script to test inserting questions with new question types.
"""

import logging
import sys
import os

# Add the parent directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.question import Question, QuestionType
from app.models.lesson import Lesson

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_question_types():
    """Test inserting questions with new question types."""
    logger.info("Testing question types...")
    
    DATABASE_URL = settings.DATABASE_URL
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    try:
        with SessionLocal() as db:
            # Get the first lesson
            lesson = db.query(Lesson).first()
            if not lesson:
                logger.error("No lessons found in database!")
                return False
            
            logger.info(f"Using lesson: {lesson.title} (ID: {lesson.id})")
            
            # Test creating a question with FILL type
            test_question = Question(
                lesson_id=lesson.id,
                stem="Test question: What is 2 + 2?",
                question_type=QuestionType.FILL,
                correct_answer="4",
                explanation_correct="Correct! 2 + 2 = 4",
                explanation_incorrect="Try again. What do you get when you add 2 and 2?",
                hint_text="Add the two numbers together",
                scenario_text="You're helping a friend with basic math",
                real_world_context="This is useful for everyday calculations",
                learning_objectives=["basic_arithmetic"],
                prerequisite_concepts=["counting"],
                difficulty_tag="EASY",
                concept_tags=["arithmetic"],
                pitfall_tags=[]
            )
            
            db.add(test_question)
            db.commit()
            logger.info("✅ Successfully created question with FILL type!")
            
            # Test creating a question with TAP_WORDS type
            test_question2 = Question(
                lesson_id=lesson.id,
                stem="Tap the words to complete: The probability of heads is ___",
                question_type=QuestionType.TAP_WORDS,
                correct_answer="1/2",
                explanation_correct="Perfect! For a fair coin, P(heads) = 1/2",
                explanation_incorrect="Remember, a fair coin has two equally likely outcomes",
                hint_text="What fraction represents half?",
                scenario_text="You're explaining probability to a friend",
                real_world_context="This is fundamental to understanding probability",
                learning_objectives=["basic_probability"],
                prerequisite_concepts=["fractions"],
                difficulty_tag="EASY",
                concept_tags=["probability"],
                pitfall_tags=[]
            )
            
            db.add(test_question2)
            db.commit()
            logger.info("✅ Successfully created question with TAP_WORDS type!")
            
            # Test creating a question with MATCH type
            test_question3 = Question(
                lesson_id=lesson.id,
                stem="Match the probability with the event:",
                question_type=QuestionType.MATCH,
                correct_answer="heads:1/2,tails:1/2",
                explanation_correct="Excellent! Both outcomes are equally likely",
                explanation_incorrect="For a fair coin, both outcomes have the same probability",
                hint_text="A fair coin has two equally likely outcomes",
                scenario_text="You're setting up a fair game",
                real_world_context="This ensures fair play in games of chance",
                learning_objectives=["basic_probability"],
                prerequisite_concepts=["fractions"],
                difficulty_tag="EASY",
                concept_tags=["probability"],
                pitfall_tags=[]
            )
            
            db.add(test_question3)
            db.commit()
            logger.info("✅ Successfully created question with MATCH type!")
            
            logger.info("🎉 All question types tested successfully!")
            return True
            
    except Exception as e:
        logger.error(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    test_question_types()
