#!/usr/bin/env python3
"""
Add Duolingo-style columns to existing database tables.

This script adds the new columns needed for Duolingo-style features
to the existing database tables.
"""

import logging
import sys
from pathlib import Path

# Add the parent directory to the path so we can import app modules
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.core.database import SessionLocal, engine

logger = logging.getLogger(__name__)


def add_duolingo_columns():
    """Add Duolingo-style columns to the database."""
    logger.info("Adding Duolingo-style columns to database...")
    
    with SessionLocal() as db:
        try:
            # Add new columns to questions table
            logger.info("Adding columns to questions table...")
            
            # Check if columns already exist
            result = db.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'questions' 
                AND column_name IN ('scenario_text', 'real_world_context', 'learning_objectives', 'prerequisite_concepts')
            """))
            existing_columns = [row[0] for row in result.fetchall()]
            
            # Add scenario_text column
            if 'scenario_text' not in existing_columns:
                db.execute(text("""
                    ALTER TABLE questions 
                    ADD COLUMN scenario_text TEXT
                """))
                logger.info("✓ Added scenario_text column")
            
            # Add real_world_context column
            if 'real_world_context' not in existing_columns:
                db.execute(text("""
                    ALTER TABLE questions 
                    ADD COLUMN real_world_context TEXT
                """))
                logger.info("✓ Added real_world_context column")
            
            # Add learning_objectives column
            if 'learning_objectives' not in existing_columns:
                db.execute(text("""
                    ALTER TABLE questions 
                    ADD COLUMN learning_objectives JSONB DEFAULT '[]'::jsonb
                """))
                logger.info("✓ Added learning_objectives column")
            
            # Add prerequisite_concepts column
            if 'prerequisite_concepts' not in existing_columns:
                db.execute(text("""
                    ALTER TABLE questions 
                    ADD COLUMN prerequisite_concepts JSONB DEFAULT '[]'::jsonb
                """))
                logger.info("✓ Added prerequisite_concepts column")
            
            # Add new question types to enum if they don't exist
            logger.info("Adding new question types...")
            
            # Check existing question types
            result = db.execute(text("""
                SELECT unnest(enum_range(NULL::questiontype)) as question_type
            """))
            existing_types = [row[0] for row in result.fetchall()]
            
            new_types = ['fill', 'tap_words', 'match']
            for question_type in new_types:
                if question_type not in existing_types:
                    try:
                        db.execute(text(f"""
                            ALTER TYPE questiontype ADD VALUE '{question_type}'
                        """))
                        logger.info(f"✓ Added question type: {question_type}")
                    except Exception as e:
                        logger.warning(f"Could not add question type {question_type}: {e}")
            
            # Create indexes for new columns
            logger.info("Creating indexes for new columns...")
            
            try:
                db.execute(text("""
                    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_questions_scenario_text 
                    ON questions USING gin(to_tsvector('english', scenario_text))
                """))
                logger.info("✓ Created index for scenario_text")
            except Exception as e:
                logger.warning(f"Could not create scenario_text index: {e}")
            
            try:
                db.execute(text("""
                    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_questions_learning_objectives 
                    ON questions USING gin(learning_objectives)
                """))
                logger.info("✓ Created index for learning_objectives")
            except Exception as e:
                logger.warning(f"Could not create learning_objectives index: {e}")
            
            # Commit all changes
            db.commit()
            logger.info("✅ All Duolingo-style columns added successfully!")
            
        except Exception as e:
            db.rollback()
            logger.error(f"❌ Failed to add columns: {e}")
            raise


def verify_columns():
    """Verify that the new columns were added successfully."""
    logger.info("Verifying new columns...")
    
    with SessionLocal() as db:
        try:
            # Check questions table columns
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
                logger.info(f"  ✓ {col[0]} ({col[1]}) - nullable: {col[2]}, default: {col[3]}")
            
            # Check question types
            result = db.execute(text("""
                SELECT unnest(enum_range(NULL::questiontype)) as question_type
                ORDER BY question_type
            """))
            
            question_types = [row[0] for row in result.fetchall()]
            logger.info(f"Available question types: {', '.join(question_types)}")
            
            # Check indexes
            result = db.execute(text("""
                SELECT indexname, indexdef
                FROM pg_indexes 
                WHERE tablename = 'questions' 
                AND indexname LIKE '%scenario%' OR indexname LIKE '%learning%'
            """))
            
            indexes = result.fetchall()
            if indexes:
                logger.info("New indexes created:")
                for idx in indexes:
                    logger.info(f"  ✓ {idx[0]}")
            
        except Exception as e:
            logger.error(f"Error verifying columns: {e}")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    try:
        add_duolingo_columns()
        verify_columns()
        
        print("\n🎉 Duolingo-style columns added successfully!")
        print("Your database now supports:")
        print("  ✓ Real-world scenarios in questions")
        print("  ✓ Learning objectives tracking")
        print("  ✓ Prerequisite concepts")
        print("  ✓ New question types (fill, tap_words, match)")
        print("  ✓ Performance indexes")
        
    except Exception as e:
        logger.error(f"Script failed: {e}")
        sys.exit(1)
