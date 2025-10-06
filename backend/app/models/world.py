'''
World Model

Represents the top-level learning domains/subjects.
'''

from sqlalchemy import (
    Column, String, Integer, Text, Boolean,
    Index, CheckConstraint
)
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class World(Base, TimestampMixin):
    '''
    World represents a major learning domain or subject area.
    
    For example:
    - "Probability Basics"
    - "Statistical Inference" 
    - "Data Visualization"
    - "Experimental Design"
    '''
    
    __tablename__ = "worlds"
    
    # Primary key
    id = Column(
        Integer,
        primary_key=True,
        index=True,
        comment="Unique world identifier"
    )
    
    # Content
    title = Column(
        String(200),
        nullable=False,
        unique=True,
        comment="World title"
    )
    
    description = Column(
        Text,
        nullable=True,
        comment="What this world covers"
    )
    
    # Icon/Visual
    icon = Column(
        String(100),
        nullable=True,
        comment="Icon identifier or emoji"
    )
    
    color = Column(
        String(7),  # Hex color code
        nullable=True,
        comment="Theme color for the world"
    )
    
    # Ordering and status
    order_index = Column(
        Integer,
        nullable=False,
        default=0,
        comment="Display order"
    )
    
    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
        comment="Whether this world is available to users"
    )
    
    # Difficulty/Prerequisites
    difficulty_level = Column(
        Integer,
        nullable=False,
        default=1,
        comment="Overall difficulty level (1-5)"
    )
    
    # Estimated completion
    estimated_hours = Column(
        Integer,
        default=10,
        nullable=False,
        comment="Estimated completion time in hours"
    )
    
    # Relationships
    modules = relationship("Module", back_populates="world", cascade="all, delete-orphan")
    
    # Indexes and constraints
    __table_args__ = (
        Index('ix_worlds_order', 'order_index'),
        Index('ix_worlds_active', 'is_active'),
        CheckConstraint('difficulty_level >= 1 AND difficulty_level <= 5', name='valid_difficulty'),
        CheckConstraint('estimated_hours > 0', name='positive_hours'),
    )
