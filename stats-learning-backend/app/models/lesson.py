'''
Lesson Model

Individual lessons containing content and simulations.
'''

from sqlalchemy import (
    Column, String, Integer, Text, Boolean, JSON, ForeignKey,
    Index
)
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class Lesson(Base, TimestampMixin):
    '''
    Lesson contains the actual learning content.
    
    Each lesson includes:
    - Educational content (text, images, examples)
    - Interactive simulations
    - Quiz questions
    '''
    
    __tablename__ = "lessons"
    
    # Primary key
    id = Column(
        Integer,
        primary_key=True,
        index=True,
        comment="Unique lesson identifier"
    )
    
    # Foreign key to level
    level_id = Column(
        Integer,
        ForeignKey("levels.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Parent level"
    )
    
    # Basic information
    title = Column(
        String(200),
        nullable=False,
        comment="Lesson title"
    )
    
    slug = Column(
        String(100),
        nullable=True,
        index=True,
        comment="URL-friendly identifier"
    )
    
    # Learning content
    learning_objectives = Column(
        JSON,  # Using JSON for structured data
        nullable=True,
        comment="List of learning objectives"
    )
    
    content_json = Column(
        JSON,
        nullable=False,
        default={},
        comment="Main lesson content (structured JSON)"
    )
    
    # Simulation configuration
    sim_config_json = Column(
        JSON,
        nullable=True,
        comment="Configuration for interactive simulations"
    )
    
    # Media
    thumbnail_url = Column(
        String(500),
        nullable=True,
        comment="Lesson thumbnail image"
    )
    
    video_url = Column(
        String(500),
        nullable=True,
        comment="Optional video content"
    )
    
    # Metadata
    estimated_minutes = Column(
        Integer,
        default=10,
        nullable=False,
        comment="Estimated completion time"
    )
    
    xp_reward = Column(
        Integer,
        default=10,
        nullable=False,
        comment="XP awarded for completion"
    )
    
    # Publishing
    is_published = Column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
        comment="Whether lesson is available to users"
    )
    
    # Ordering
    order_index = Column(
        Integer,
        nullable=False,
        default=0,
        comment="Order within the level"
    )
    
    # Relationships
    level = relationship("Level", back_populates="lessons")
    quiz = relationship("Quiz", back_populates="lesson", uselist=False, cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="lesson", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('ix_lessons_level_order', 'level_id', 'order_index'),
        Index('ix_lessons_published', 'is_published'),
    )
    
    @property
    def content_type(self):
        '''Determine primary content type'''
        if self.video_url is not None:
            return "video"
        elif self.sim_config_json is not None:
            return "interactive"
        else:
            return "reading"
