#!/usr/bin/env python3
"""
Script to create the UserGamification table in the database.
"""

import logging
import sys
import os

# Add the parent directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.gamification import UserGamification

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_gamification_table():
    """Create the UserGamification table if it doesn't exist."""
    logger.info("Creating UserGamification table...")
    
    DATABASE_URL = settings.DATABASE_URL
    engine = create_engine(DATABASE_URL)
    
    try:
        # Create the table
        UserGamification.__table__.create(engine, checkfirst=True)
        logger.info("✅ UserGamification table created successfully!")
        
        # Verify the table exists
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_name = 'user_gamification'
            """))
            if result.fetchone():
                logger.info("✓ Table verification successful")
            else:
                logger.warning("⚠ Table verification failed")
                
    except Exception as e:
        logger.error(f"❌ Failed to create UserGamification table: {e}")
        raise

if __name__ == "__main__":
    create_gamification_table()
