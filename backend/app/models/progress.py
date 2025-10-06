'''
User Progress Model

Tracks user progress through lessons and content.
'''

from enum import Enum
from datetime import datetime

from sqlalchemy import (
    Column, Integer, Float, DateTime, ForeignKey,
    Enum as SQLEnum, UniqueConstraint, Index, Text
)
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class ProgressStatus(str, Enum):
    '''Progress status for content'''
    NEW = "new"              # Not started
    STARTED = "started"      # In progress
    COMPLETED = "completed"  # Finished but not mastered
    MASTERED = "mastered"    # Achieved mastery


class UserProgress(Base, TimestampMixin):
    '''
    Tracks individual user's progress through content.
    
    One record per user-lesson combination.
    '''
    
    __tablename__ = "user_progress"
    
    # Primary key
    id = Column(
        Integer,
        primary_key=True,
        index=True,
        comment="Unique progress record identifier"
    )
    
    # User and content references
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="User making progress"
    )
    
    world_id = Column(
        Integer,
        ForeignKey("worlds.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
        comment="World (for aggregation)"
    )
    
    module_id = Column(
        Integer,
        ForeignKey("modules.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
        comment="Module (for aggregation)"
    )
    
    level_id = Column(
        Integer,
        ForeignKey("levels.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
        comment="Level (for aggregation)"
    )
    
    lesson_id = Column(
        Integer,
        ForeignKey("lessons.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Specific lesson"
    )
    
    # Progress tracking
    status = Column(
        SQLEnum(ProgressStatus),
        nullable=False,
        default=ProgressStatus.NEW,
        index=True,
        comment="Current progress status"
    )
    
    # Quiz performance
    best_score = Column(
        Float,
        nullable=True,
        comment="Best quiz score (0.0 to 1.0)"
    )
    
    last_score = Column(
        Float,
        nullable=True,
        comment="Most recent quiz score"
    )
    
    attempts_count = Column(
        Integer,
        default=0,
        nullable=False,
        comment="Number of quiz attempts"
    )
    
    # Simulation tracking
    simulations_run = Column(
        Integer,
        default=0,
        nullable=False,
        comment="Number of simulations run"
    )
    
    # Time tracking
    time_spent_seconds = Column(
        Integer,
        default=0,
        nullable=False,
        comment="Total time spent on lesson"
    )
    
    started_at = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="When user started this lesson"
    )
    
    completed_at = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="When user completed this lesson"
    )
    
    mastered_at = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="When user achieved mastery"
    )
    
    last_attempt_at = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Last quiz attempt timestamp"
    )
    
    # User reflection (for mastery)
    reflection_text = Column(
        Text,
        nullable=True,
        comment="User's reflection on the lesson"
    )
    
    # Relationships
    user = relationship("User", back_populates="progress_records")
    
    # Constraints and indexes
    __table_args__ = (
        # Ensure one progress record per user-lesson
        UniqueConstraint('user_id', 'lesson_id', name='unique_user_lesson'),
        
        # Composite indexes for common queries
        Index('ix_progress_user_status', 'user_id', 'status'),
        Index('ix_progress_user_world', 'user_id', 'world_id'),
        Index('ix_progress_lesson_status', 'lesson_id', 'status'),
    )
    
    def update_status(self):
        '''Update status based on performance'''
        if self.best_score and self.best_score >= 0.7 and self.reflection_text:
            self.status = ProgressStatus.MASTERED
            if not self.mastered_at:
                self.mastered_at = datetime.utcnow()
        elif self.attempts_count > 0:
            self.status = ProgressStatus.COMPLETED
            if not self.completed_at:
                self.completed_at = datetime.utcnow()
        elif self.started_at:
            self.status = ProgressStatus.STARTED
