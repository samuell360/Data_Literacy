'''
Database Initialization

Initialize database with tables and seed data if needed.
'''

import logging
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, create_tables
from app.core.config import settings
from app.core.security import get_password_hash, verify_password

logger = logging.getLogger(__name__)


def init_db() -> None:
    '''
    Initialize the database.
    
    This function:
    1. Creates all database tables
    2. Creates default admin user if specified
    
    Called during application startup.
    Note: Use scripts/seed.py for content population.
    '''
    logger.info("Initializing database...")
    
    # Create all tables
    create_tables()
    
    # Create initial data
    with SessionLocal() as db:
        create_default_admin(db)
    
    logger.info("Database initialization complete")


def create_default_admin(db: Session) -> None:
    '''
    Create default admin user if it doesn't exist.
    
    Args:
        db: Database session
    '''
    try:
        # Import here to avoid circular imports
        from app.crud.crud_user import user as crud_user
        from app.schemas.user import UserCreate
        
        # Check if admin already exists
        admin = crud_user.get_by_email(db, email=settings.DEFAULT_ADMIN_EMAIL)
        if admin:
            # Optionally reset password in non-production if flag set
            if settings.ADMIN_FORCE_RESET_ON_STARTUP and settings.ENVIRONMENT in {"development", "testing"}:
                try:
                    from typing import cast
                    if not verify_password(settings.DEFAULT_ADMIN_PASSWORD, cast(str, admin.hashed_password)):
                        setattr(admin, "hashed_password", get_password_hash(settings.DEFAULT_ADMIN_PASSWORD))
                        db.add(admin)
                        db.commit()
                        db.refresh(admin)
                        logger.info("Default admin password reset as per ADMIN_FORCE_RESET_ON_STARTUP")
                except Exception as e:
                    logger.warning(f"Could not reset default admin password: {e}")
            else:
                logger.info("Default admin user already exists")
            return
        
        # Create admin user
        admin_create = UserCreate(
            email=settings.DEFAULT_ADMIN_EMAIL,
            username="admin",
            password=settings.DEFAULT_ADMIN_PASSWORD,
            full_name="Administrator",
            bio="Default administrator account",
            timezone="UTC",
            preferred_language="en",
            public_profile=True,
            allow_emails=True,
            is_admin=True
        )
        
        admin = crud_user.create(db, obj_in=admin_create)
        logger.info(f"Created default admin user: {admin.email}")
        
    except ImportError as e:
        logger.warning(f"Could not create default admin user: {e}")
        logger.info("User CRUD or schema not available yet")
    except Exception as e:
        logger.error(f"Error creating default admin user: {e}")


def reset_database() -> None:
    '''
    Reset the database by dropping and recreating all tables.
    
    WARNING: This will delete all data! Only use in development.
    '''
    if settings.ENVIRONMENT == "production":
        raise RuntimeError("Cannot reset database in production!")
    
    logger.warning("Resetting database - ALL DATA WILL BE LOST!")
    
    from app.core.database import drop_tables
    
    # Drop all tables
    drop_tables()
    
    # Recreate everything
    init_db()
    
    logger.warning("Database reset complete")
