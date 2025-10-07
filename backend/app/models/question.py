'''
Question Model

Individual quiz questions.
'''

from enum import Enum

from sqlalchemy import (
    Column, String, Integer, Text, ForeignKey, Float,
    Enum as SQLEnum, Index
)
from sqlalchemy.orm import relationship
from sqlalchemy import JSON

from app.db.base import Base, TimestampMixin


class QuestionType(str, Enum):
    '''Types of questions supported'''
    MCQ = "mcq"                    # Multiple choice
    NUMERIC = "numeric"            # Numeric answer
    SHORT_TEXT = "short_text"      # Short text answer
    CHOOSE_TEST = "choose_test"    # Choose appropriate statistical test
    TRUE_FALSE = "true_false"      # True/false question
    MULTI_SELECT = "multi_select"  # Multiple correct answers
    FILL = "fill"                  # Fill in the blank
    TAP_WORDS = "tap_words"        # Tap words to complete sentence
    MATCH = "match"                # Match pairs


class DifficultyTag(str, Enum):
    '''Question difficulty levels'''
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class Question(Base, TimestampMixin):
    '''
    Individual question for quizzes.
    
    Supports various question types with rich metadata
    for adaptive learning.
    '''
    
    __tablename__ = "questions"
    
    # Primary key
    id = Column(
        Integer,
        primary_key=True,
        index=True,
        comment="Unique question identifier"
    )
    
    # Foreign key to lesson
    lesson_id = Column(
        Integer,
        ForeignKey("lessons.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Parent lesson"
    )
    
    # Question content
    stem = Column(
        Text,
        nullable=False,
        comment="The question text"
    )
    
    question_type = Column(
        SQLEnum(QuestionType),
        nullable=False,
        default=QuestionType.MCQ,
        index=True,
        comment="Type of question"
    )
    
    # Answer options and correct answer
    options_json = Column(
        JSON,
        nullable=True,
        comment="Answer choices (for MCQ, multi-select)"
    )
    
    correct_answer = Column(
        Text,
        nullable=False,
        comment="Correct answer(s)"
    )
    
    # For numeric questions
    numeric_tolerance = Column(
        Float,
        nullable=True,
        comment="Acceptable error for numeric answers"
    )
    
    # Difficulty and categorization
    difficulty_tag = Column(
        SQLEnum(DifficultyTag),
        nullable=False,
        default=DifficultyTag.MEDIUM,
        index=True,
        comment="Question difficulty"
    )
    
    concept_tags = Column(
        JSON,
        nullable=True,
        default=list,
        comment="Concepts this question tests"
    )
    
    pitfall_tags = Column(
        JSON,
        nullable=True,
        default=list,
        comment="Common mistakes this question catches"
    )
    
    # Explanations
    explanation_correct = Column(
        Text,
        nullable=True,
        comment="Explanation shown for correct answer"
    )
    
    explanation_incorrect = Column(
        Text,
        nullable=True,
        comment="Explanation shown for wrong answer"
    )
    
    hint_text = Column(
        Text,
        nullable=True,
        comment="Optional hint for the question"
    )
    
    # Duolingo-style features
    scenario_text = Column(
        Text,
        nullable=True,
        comment="Real-world scenario context for the question"
    )
    
    real_world_context = Column(
        Text,
        nullable=True,
        comment="Real-world application explanation"
    )
    
    # Enhanced metadata for adaptive learning
    learning_objectives = Column(
        JSON,
        nullable=True,
        default=list,
        comment="Learning objectives this question addresses"
    )
    
    prerequisite_concepts = Column(
        JSON,
        nullable=True,
        default=list,
        comment="Concepts that should be understood before this question"
    )
    
    # Media
    image_url = Column(
        String(500),
        nullable=True,
        comment="Optional image for question"
    )
    
    # Statistics (updated periodically)
    times_answered = Column(
        Integer,
        default=0,
        nullable=False,
        comment="How many times answered"
    )
    
    times_correct = Column(
        Integer,
        default=0,
        nullable=False,
        comment="How many times answered correctly"
    )
    
    # Relationships
    lesson = relationship("Lesson", back_populates="questions")
    
    # Indexes
    __table_args__ = (
        Index('ix_questions_lesson_difficulty', 'lesson_id', 'difficulty_tag'),
        Index('ix_questions_type', 'question_type'),
    )
    
    @property
    def accuracy_rate(self):
        '''Calculate question accuracy rate'''
        if self.times_answered == 0:
            return 0.0
        return self.times_correct / self.times_answered
