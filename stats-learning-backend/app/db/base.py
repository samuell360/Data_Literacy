'''
Database Base Classes

SQLAlchemy declarative base and common mixins.
'''

from datetime import datetime
from typing import Any

from sqlalchemy import Column, DateTime, Integer
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import declarative_base, Mapped, mapped_column


# Create the SQLAlchemy declarative base
Base = declarative_base()


class TimestampMixin:
    '''
    Mixin that adds created_at and updated_at timestamps to models.
    
    Automatically tracks when records are created and last modified.
    '''
    
    @declared_attr
    def created_at(cls) -> Mapped[datetime]:
        '''Timestamp when the record was created'''
        return mapped_column(
            DateTime,
            default=datetime.utcnow,
            nullable=False,
            comment="When the record was created"
        )
    
    @declared_attr
    def updated_at(cls) -> Mapped[datetime]:
        '''Timestamp when the record was last updated'''
        return mapped_column(
            DateTime,
            default=datetime.utcnow,
            onupdate=datetime.utcnow,
            nullable=False,
            comment="When the record was last updated"
        )


class IDMixin:
    '''
    Mixin that adds a standard integer primary key.
    '''
    
    @declared_attr
    def id(cls) -> Column[int]:
        '''Primary key ID'''
        return Column(
            Integer,
            primary_key=True,
            index=True,
            comment="Unique identifier"
        )


# Import all models here to ensure they are registered with SQLAlchemy
# This is important for Alembic migrations to detect all tables

def import_models() -> None:
    '''
    Import all models to register them with SQLAlchemy.
    
    This ensures that all tables are created when calling Base.metadata.create_all()
    and that Alembic can detect all models for migrations.
    '''
    # Import all model modules here
    from app.models import (
        user,
        world,
        module,
        level,
        lesson,
        question,
        quiz,
        progress,
        gamification,
    )
