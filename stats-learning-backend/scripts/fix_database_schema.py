#!/usr/bin/env python3
"""
Script to properly add the Duolingo-style columns to the database.
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

def fix_database_schema():
    """Add the missing columns to the questions table."""
    logger.info("Fixing database schema...")
    
    DATABASE_URL = settings.DATABASE_URL
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    try:
        with SessionLocal() as db:
            # Check current columns
            result = db.execute(text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'questions'
                AND column_name IN ('scenario_text', 'real_world_context', 'learning_objectives', 'prerequisite_concepts')
            """))
            existing_columns = [row[0] for row in result.fetchall()]
            logger.info(f"Existing columns: {existing_columns}")
            
            # Add missing columns
            if 'scenario_text' not in existing_columns:
                db.execute(text("ALTER TABLE questions ADD COLUMN scenario_text TEXT"))
                logger.info("✓ Added scenario_text column")
            
            if 'real_world_context' not in existing_columns:
                db.execute(text("ALTER TABLE questions ADD COLUMN real_world_context TEXT"))
                logger.info("✓ Added real_world_context column")
            
            if 'learning_objectives' not in existing_columns:
                db.execute(text("ALTER TABLE questions ADD COLUMN learning_objectives JSONB DEFAULT '[]'::jsonb"))
                logger.info("✓ Added learning_objectives column")
            
            if 'prerequisite_concepts' not in existing_columns:
                db.execute(text("ALTER TABLE questions ADD COLUMN prerequisite_concepts JSONB DEFAULT '[]'::jsonb"))
                logger.info("✓ Added prerequisite_concepts column")
            
            # Add new question types
            try:
                db.execute(text("ALTER TYPE questiontype ADD VALUE IF NOT EXISTS 'fill'"))
                logger.info("✓ Added question type: fill")
            except Exception as e:
                logger.info(f"Question type 'fill' might already exist: {e}")
            
            try:
                db.execute(text("ALTER TYPE questiontype ADD VALUE IF NOT EXISTS 'tap_words'"))
                logger.info("✓ Added question type: tap_words")
            except Exception as e:
                logger.info(f"Question type 'tap_words' might already exist: {e}")
            
            try:
                db.execute(text("ALTER TYPE questiontype ADD VALUE IF NOT EXISTS 'match'"))
                logger.info("✓ Added question type: match")
            except Exception as e:
                logger.info(f"Question type 'match' might already exist: {e}")
            
            # Commit all changes
            db.commit()
            logger.info("✅ All changes committed successfully!")
            
            # Verify the changes
            result = db.execute(text("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = 'questions'
                AND column_name IN ('scenario_text', 'real_world_context', 'learning_objectives', 'prerequisite_concepts')
                ORDER BY column_name
            """))
            
            columns = result.fetchall()
            logger.info("New columns in questions table:")
            for col in columns:
                logger.info(f"  - {col[0]} ({col[1]}, Nullable: {col[2]}, Default: {col[3]})")
                
    except Exception as e:
        logger.error(f"❌ Failed to fix database schema: {e}")
        raise

if __name__ == "__main__":
    fix_database_schema()
