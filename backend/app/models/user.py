'''
User Model

Core user authentication and profile management.
'''

from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Boolean, DateTime, Text,
    Index, CheckConstraint
)
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    '''
    User model for authentication and profile management.
    
    Handles user accounts, authentication, and basic profile information.
    '''
    
    __tablename__ = "users"
    
    # Primary key
    id = Column(
        Integer,
        primary_key=True,
        index=True,
        comment="Unique user identifier"
    )
    
    # Authentication
    email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
        comment="User email address"
    )
    
    username = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
        comment="Unique username"
    )
    
    hashed_password = Column(
        String(255),
        nullable=False,
        comment="Hashed password"
    )
    
    # Profile
    full_name = Column(
        String(200),
        nullable=True,
        comment="User's full name"
    )
    
    bio = Column(
        Text,
        nullable=True,
        comment="User biography"
    )
    
    avatar_url = Column(
        String(500),
        nullable=True,
        comment="URL to user's avatar image"
    )
    
    # Status and permissions
    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
        comment="Whether user account is active"
    )
    
    is_verified = Column(
        Boolean,
        default=False,
        nullable=False,
        comment="Whether user email is verified"
    )
    
    is_admin = Column(
        Boolean,
        default=False,
        nullable=False,
        comment="Whether user has admin privileges"
    )
    
    # Activity tracking
    last_login = Column(
        DateTime,
        nullable=True,
        comment="Last login timestamp"
    )
    
    login_count = Column(
        Integer,
        default=0,
        nullable=False,
        comment="Total number of logins"
    )
    
    # Learning preferences
    timezone = Column(
        String(50),
        default="UTC",
        nullable=False,
        server_default="UTC",
        comment="User's timezone"
    )
    
    preferred_language = Column(
        String(10),
        default="en",
        nullable=False,
        server_default="en",
        comment="Preferred language code"
    )
    
    # Privacy settings
    public_profile = Column(
        Boolean,
        default=True,
        nullable=False,
        server_default="1",
        comment="Whether profile is public"
    )
    
    allow_emails = Column(
        Boolean,
        default=True,
        nullable=False,
        server_default="1",
        comment="Whether to send email notifications"
    )
    
    # Relationships
    progress_records = relationship("UserProgress", back_populates="user", cascade="all, delete-orphan")
    # xp_records = relationship("UserXP", back_populates="user", cascade="all, delete-orphan")
    # badges = relationship("UserBadge", back_populates="user", cascade="all, delete-orphan")
    # streaks = relationship("Streak", back_populates="user", cascade="all, delete-orphan")
    
    # Indexes and constraints
    __table_args__ = (
        Index('ix_users_active', 'is_active'),
        Index('ix_users_verified', 'is_verified'),
        Index('ix_users_last_login', 'last_login'),
        CheckConstraint('length(username) >= 3', name='username_min_length'),
        CheckConstraint('length(email) >= 5', name='email_min_length'),
    )
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"
