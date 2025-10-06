'''
Level Model

Represents difficulty levels within a module.
'''

from enum import Enum

from sqlalchemy import (
    Column, String, Integer, ForeignKey, Enum as SQLEnum,
    Index, CheckConstraint
)
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class DifficultyLevel(str, Enum):
    '''Difficulty level enumeration'''
    ROOKIE = "rookie"
    REGULAR = "regular"
    CHALLENGER = "challenger"
    MASTER = "master"
    WIZARD = "wizard"


class Level(Base, TimestampMixin):
    '''
    Level represents a difficulty tier within a module.
    
    Each module can have multiple difficulty levels, allowing
    users to progress from easy to hard content.
    '''
    
    __tablename__ = "levels"
    
    # Primary key
    id = Column(
        Integer,
        primary_key=True,
        index=True,
        comment="Unique level identifier"
    )
    
    # Foreign key to module
    module_id = Column(
        Integer,
        ForeignKey("modules.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Parent module"
    )
    
    # Level information
    title = Column(
        String(200),
        nullable=False,
        comment="Level title"
    )
    
    difficulty = Column(
        SQLEnum(DifficultyLevel),
        nullable=False,
        default=DifficultyLevel.REGULAR,
        index=True,
        comment="Difficulty tier"
    )
    
    # Ordering
    order_index = Column(
        Integer,
        nullable=False,
        default=0,
        comment="Order within the module"
    )
    
    # Unlock requirements
    unlock_xp = Column(
        Integer,
        default=0,
        nullable=False,
        comment="XP required to unlock this level"
    )
    
    # Reward badge (optional)
    completion_badge = Column(
        String(50),
        nullable=True,
        comment="Badge code awarded on completion"
    )
    
    # Relationships
    module = relationship("Module", back_populates="levels")
    lessons = relationship("Lesson", back_populates="level", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('ix_levels_module_order', 'module_id', 'order_index'),
    )
