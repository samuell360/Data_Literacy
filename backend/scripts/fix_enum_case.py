#!/usr/bin/env python3
"""
Script to fix the enum case inconsistency in the database.
"""

import logging
import sys
import os

# Add the parent directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_enum_case():
    """Fix the enum case inconsistency by recreating the enum with consistent case."""
    logger.info("Fixing enum case inconsistency...")
    
    DATABASE_URL = settings.DATABASE_URL
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    try:
        with SessionLocal() as db:
            # First, let's see what we have
            result = db.execute(text("""
                SELECT unnest(enum_range(NULL::questiontype)) as question_type
                ORDER BY question_type
            """))
            current_types = [t[0] for t in result.fetchall()]
            logger.info(f"Current enum values: {current_types}")
            
            # Create a new enum with consistent uppercase values
            db.execute(text("""
                CREATE TYPE questiontype_new AS ENUM (
                    'MCQ', 'NUMERIC', 'SHORT_TEXT', 'CHOOSE_TEST', 
                    'TRUE_FALSE', 'MULTI_SELECT', 'FILL', 'TAP_WORDS', 'MATCH'
                )
            """))
            logger.info("✓ Created new enum type with consistent case")
            
            # Update the questions table to use the new enum
            db.execute(text("""
                ALTER TABLE questions 
                ALTER COLUMN question_type TYPE questiontype_new 
                USING question_type::text::questiontype_new
            """))
            logger.info("✓ Updated questions table to use new enum")
            
            # Drop the old enum and rename the new one
            db.execute(text("DROP TYPE questiontype"))
            db.execute(text("ALTER TYPE questiontype_new RENAME TO questiontype"))
            logger.info("✓ Replaced old enum with new one")
            
            # Verify the fix
            result = db.execute(text("""
                SELECT unnest(enum_range(NULL::questiontype)) as question_type
                ORDER BY question_type
            """))
            new_types = [t[0] for t in result.fetchall()]
            logger.info(f"New enum values: {new_types}")
            
            db.commit()
            logger.info("✅ Enum case fixed successfully!")
            return True
            
    except Exception as e:
        logger.error(f"❌ Failed to fix enum case: {e}")
        db.rollback()
        return False

if __name__ == "__main__":
    fix_enum_case()
