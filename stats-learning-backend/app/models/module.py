'''
Module Model

Represents chapters or units within a world.
'''

from sqlalchemy import (
    Column, String, Integer, Text, ForeignKey,
    Index, CheckConstraint
)
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class Module(Base, TimestampMixin):
    '''
    Module represents a chapter or unit within a world.
    
    For example, in "Probability Basics" world, modules might be:
    - "Introduction to Probability"
    - "Conditional Probability"
    - "Bayes' Theorem"
    '''
    
    __tablename__ = "modules"
    
    # Primary key
    id = Column(
        Integer,
        primary_key=True,
        index=True,
        comment="Unique module identifier"
    )
    
    # Foreign key to world
    world_id = Column(
        Integer,
        ForeignKey("worlds.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Parent world"
    )
    
    # Content
    title = Column(
        String(200),
        nullable=False,
        comment="Module title"
    )
    
    description = Column(
        Text,
        nullable=True,
        comment="What this module covers"
    )
    
    learning_objectives = Column(
        Text,  # Could be JSON in practice
        nullable=True,
        comment="Learning objectives for this module"
    )
    
    # Ordering
    order_index = Column(
        Integer,
        nullable=False,
        default=0,
        comment="Order within the world"
    )
    
    # Prerequisites (simple version - could be more complex)
    prerequisite_module_id = Column(
        Integer,
        ForeignKey("modules.id", ondelete="SET NULL"),
        nullable=True,
        comment="Module that must be completed first"
    )
    
    # Estimated time
    estimated_minutes = Column(
        Integer,
        default=30,
        nullable=False,
        comment="Estimated completion time in minutes"
    )
    
    # Relationships
    world = relationship("World", back_populates="modules")
    levels = relationship("Level", back_populates="module", cascade="all, delete-orphan")
    prerequisite = relationship("Module", remote_side=[id])
    
    # Indexes
    __table_args__ = (
        Index('ix_modules_world_order', 'world_id', 'order_index'),
    )
