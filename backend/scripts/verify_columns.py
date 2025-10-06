#!/usr/bin/env python3
"""
Script to verify that the new columns exist in the database.
"""

import logging
import sys
import os

# Add the parent directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def verify_columns():
    """Verify that the new columns exist in the questions table."""
    logger.info("Verifying new columns in questions table...")
    
    DATABASE_URL = settings.DATABASE_URL
    engine = create_engine(DATABASE_URL)
    
    try:
        with engine.connect() as conn:
            # Check if columns exist
            result = conn.execute(text("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = 'questions'
                AND column_name IN ('scenario_text', 'real_world_context', 'learning_objectives', 'prerequisite_concepts')
                ORDER BY column_name
            """))
            
            columns = result.fetchall()
            if columns:
                logger.info("✅ New columns found in questions table:")
                for col in columns:
                    logger.info(f"  - {col[0]} ({col[1]}, Nullable: {col[2]}, Default: {col[3]})")
            else:
                logger.error("❌ No new columns found in questions table!")
                return False
                
            # Check question types
            result = conn.execute(text("""
                SELECT unnest(enum_range(NULL::questiontype)) as question_type
                ORDER BY question_type
            """))
            
            question_types = result.fetchall()
            logger.info("Available question types: " + ", ".join([t[0] for t in question_types]))
            
            return True
            
    except Exception as e:
        logger.error(f"❌ Error verifying columns: {e}")
        return False

if __name__ == "__main__":
    verify_columns()
