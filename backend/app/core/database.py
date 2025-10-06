'''
Database Configuration

SQLAlchemy engine, session, and database connection management.
'''

import logging
from typing import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.core.config import settings

logger = logging.getLogger(__name__)


# Create database engine with connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    # Connection pool settings for production performance
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_pre_ping=settings.DB_POOL_PRE_PING,
    # Echo SQL queries in development
    echo=settings.ENVIRONMENT == "development",
)


# Add SQLite foreign key support if using SQLite (for testing)
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    '''Enable foreign key constraints for SQLite connections'''
    if 'sqlite' in str(dbapi_connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db() -> Generator[Session, None, None]:
    '''
    Get database session for dependency injection.
    
    This function is used with FastAPI's Depends() to inject
    database sessions into route handlers.
    
    Yields:
        Session: SQLAlchemy database session
        
    Example:
        ```python
        @app.get("/users/")
        def get_users(db: Session = Depends(get_db)):
            return crud.user.get_multi(db)
        ```
    '''
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables() -> None:
    '''
    Create all database tables.
    
    This function creates all tables defined in the models.
    It's typically called during application startup or in migrations.
    '''
    from app.db.base import Base, import_models
    
    # Import all models to register them
    import_models()
    
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")


def drop_tables() -> None:
    '''
    Drop all database tables.
    
    WARNING: This will delete all data! Only use in development/testing.
    '''
    from app.db.base import Base, import_models
    
    # Import all models to register them
    import_models()
    
    logger.warning("Dropping all database tables...")
    Base.metadata.drop_all(bind=engine)
    logger.warning("All database tables dropped")
