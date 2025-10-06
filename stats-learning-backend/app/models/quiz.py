'''
Quiz Model

Quiz configuration for lessons.
'''

from sqlalchemy import (
    Column, Integer, Boolean, Float, ForeignKey,
    CheckConstraint
)
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class Quiz(Base, TimestampMixin):
    '''
    Quiz configuration for a lesson.
    
    Defines how the quiz works: adaptive vs fixed,
    passing threshold, number of questions, etc.
    '''
    
    __tablename__ = "quizzes"
    
    # Primary key
    id = Column(
        Integer,
        primary_key=True,
        index=True,
        comment="Unique quiz identifier"
    )
    
    # Foreign key to lesson (one-to-one)
    lesson_id = Column(
        Integer,
        ForeignKey("lessons.id", ondelete="CASCADE"),
        unique=True,  # One quiz per lesson
        nullable=False,
        index=True,
        comment="Parent lesson"
    )
    
    # Quiz configuration
    is_adaptive = Column(
        Boolean,
        default=True,
        nullable=False,
        comment="Whether quiz adapts to user performance"
    )
    
    min_questions = Column(
        Integer,
        default=5,
        nullable=False,
        comment="Minimum questions to ask"
    )
    
    max_questions = Column(
        Integer,
        default=10,
        nullable=False,
        comment="Maximum questions to ask"
    )
    
    pass_threshold = Column(
        Float,
        default=0.7,
        nullable=False,
        comment="Score needed to pass (0.0 to 1.0)"
    )
    
    # Time limits (optional)
    time_limit_seconds = Column(
        Integer,
        nullable=True,
        comment="Optional time limit for quiz"
    )
    
    question_time_limit = Column(
        Integer,
        nullable=True,
        comment="Optional time limit per question"
    )
    
    # Retry policy
    max_attempts = Column(
        Integer,
        nullable=True,  # NULL = unlimited
        comment="Maximum attempts allowed"
    )
    
    retry_delay_minutes = Column(
        Integer,
        default=0,
        nullable=False,
        comment="Required wait between attempts"
    )
    
    # Feedback settings
    show_correct_answers = Column(
        Boolean,
        default=True,
        nullable=False,
        comment="Show correct answers after submission"
    )
    
    show_explanations = Column(
        Boolean,
        default=True,
        nullable=False,
        comment="Show explanations for answers"
    )
    
    # Relationships
    lesson = relationship("Lesson", back_populates="quiz")
    
    # Constraints
    __table_args__ = (
        CheckConstraint('pass_threshold >= 0 AND pass_threshold <= 1', 
                       name='valid_threshold'),
        CheckConstraint('min_questions > 0 AND min_questions <= max_questions', 
                       name='valid_question_count'),
    )
