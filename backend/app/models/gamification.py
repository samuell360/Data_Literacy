'''
Gamification Models

XP, badges, streaks, and leaderboards.
'''

from datetime import date, datetime
from enum import Enum

from sqlalchemy import (
    Column, Integer, String, Date, DateTime, ForeignKey,
    UniqueConstraint, Index, CheckConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy import JSON

from app.db.base import Base, TimestampMixin


class UserXP(Base, TimestampMixin):
    '''
    Tracks user XP (experience points) per world.
    '''
    
    __tablename__ = "user_xp"
    
    id = Column(Integer, primary_key=True, index=True)
    
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    world_id = Column(
        Integer,
        ForeignKey("worlds.id", ondelete="CASCADE"),
        nullable=True,  # NULL means global XP
        index=True
    )
    
    xp_total = Column(
        Integer,
        default=0,
        nullable=False,
        comment="Total XP earned"
    )
    
    level = Column(
        Integer,
        default=1,
        nullable=False,
        comment="Current level based on XP"
    )
    
    xp_this_week = Column(
        Integer,
        default=0,
        nullable=False,
        comment="XP earned this week"
    )
    
    xp_this_month = Column(
        Integer,
        default=0,
        nullable=False,
        comment="XP earned this month"
    )
    
    last_award_at = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Last time XP was awarded"
    )
    
    # Relationships
    # user = relationship("User", back_populates="xp_records")
    
    __table_args__ = (
        UniqueConstraint('user_id', 'world_id', name='unique_user_world_xp'),
        Index('ix_xp_total', 'xp_total'),  # For leaderboard queries
    )
    
    @staticmethod
    def calculate_level(xp: int) -> int:
        '''Calculate level from XP (simple formula)'''
        # Level up every 100 XP, with increasing requirements
        if xp < 100:
            return 1
        elif xp < 300:
            return 2
        elif xp < 600:
            return 3
        elif xp < 1000:
            return 4
        else:
            # Logarithmic progression after level 4
            return 4 + (xp - 1000) // 500


class BadgeType(str, Enum):
    '''Types of badges'''
    # Content mastery badges
    CANDY_CRUSHER = "candy_crusher"        # Probability basics
    RAFFLE_RAIDER = "raffle_raider"       # Sampling
    GOAL_GURU = "goal_guru"                # Hypothesis testing
    CURVE_RIDER = "curve_rider"            # Normal distribution
    SIM_SORCERER = "sim_sorcerer"         # Run many simulations
    SLEEP_SAMPLER = "sleep_sampler"       # t-tests
    MARGIN_MASTER = "margin_master"       # Confidence intervals
    LAB_DETECTIVE = "lab_detective"       # Chi-square tests
    CANDY_LAWYER = "candy_lawyer"         # Conditional probability
    POWER_RANGER = "power_ranger"         # Power analysis
    STAT_CHAMPION = "stat_champion"       # Complete everything
    
    # Activity badges
    FIRST_STEPS = "first_steps"           # Complete first lesson
    STREAK_WEEK = "streak_week"           # 7-day streak
    STREAK_MONTH = "streak_month"         # 30-day streak
    PERFECTIONIST = "perfectionist"       # 100% on 10 quizzes
    SPEED_DEMON = "speed_demon"           # Fast completion
    NIGHT_OWL = "night_owl"               # Study at night
    EARLY_BIRD = "early_bird"             # Study in morning


class UserBadge(Base, TimestampMixin):
    '''
    Badges earned by users.
    '''
    
    __tablename__ = "user_badges"
    
    id = Column(Integer, primary_key=True, index=True)
    
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    badge_code = Column(
        String(50),
        nullable=False,
        index=True,
        comment="Badge identifier"
    )
    
    earned_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        comment="When badge was earned"
    )
    
    meta_data = Column(
        JSON,
        nullable=True,
        comment="Additional badge data (e.g., score, time)"
    )
    
    # Relationships
    # user = relationship("User", back_populates="badges")
    
    __table_args__ = (
        UniqueConstraint('user_id', 'badge_code', name='unique_user_badge'),
    )


class Streak(Base, TimestampMixin):
    '''
    Track daily learning streaks.
    '''
    
    __tablename__ = "streaks"
    
    id = Column(Integer, primary_key=True, index=True)
    
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )
    
    current_streak = Column(
        Integer,
        default=0,
        nullable=False,
        comment="Current streak in days"
    )
    
    longest_streak = Column(
        Integer,
        default=0,
        nullable=False,
        comment="Longest streak ever"
    )
    
    last_active_date = Column(
        Date,
        nullable=True,
        index=True,
        comment="Last date user was active"
    )
    
    streak_frozen_until = Column(
        Date,
        nullable=True,
        comment="Streak freeze (vacation mode)"
    )
    
    total_active_days = Column(
        Integer,
        default=0,
        nullable=False,
        comment="Total days active"
    )
    
    # Relationships
    # user = relationship("User", back_populates="streaks")
    
    def update_streak(self, activity_date: date = None):
        '''Update streak based on activity'''
        if activity_date is None:
            activity_date = date.today()
        
        if self.last_active_date is None:
            # First activity
            self.current_streak = 1
            self.longest_streak = 1
            self.last_active_date = activity_date
            self.total_active_days = 1
        elif activity_date == self.last_active_date:
            # Already active today
            pass
        elif (activity_date - self.last_active_date).days == 1:
            # Consecutive day
            self.current_streak += 1
            self.longest_streak = max(self.longest_streak, self.current_streak)
            self.last_active_date = activity_date
            self.total_active_days += 1
        elif (activity_date - self.last_active_date).days > 1:
            # Streak broken (unless frozen)
            if self.streak_frozen_until and activity_date <= self.streak_frozen_until:
                # Streak was frozen
                self.last_active_date = activity_date
                self.total_active_days += 1
            else:
                # Streak broken
                self.current_streak = 1
                self.last_active_date = activity_date
                self.total_active_days += 1


class UserGamification(Base, TimestampMixin):
    '''
    Consolidated gamification data for a user.
    
    This table combines XP, hearts, streaks, and other
    gamification elements for easy access.
    '''
    
    __tablename__ = "user_gamification"
    
    id = Column(Integer, primary_key=True, index=True)
    
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )
    
    total_xp = Column(
        Integer,
        default=0,
        nullable=False,
        comment="Total XP earned across all worlds"
    )
    
    current_streak = Column(
        Integer,
        default=0,
        nullable=False,
        comment="Current learning streak in days"
    )
    
    longest_streak = Column(
        Integer,
        default=0,
        nullable=False,
        comment="Longest streak ever achieved"
    )
    
    hearts = Column(
        Integer,
        default=5,
        nullable=False,
        comment="Current hearts (lives)"
    )
    
    max_hearts = Column(
        Integer,
        default=5,
        nullable=False,
        comment="Maximum hearts possible"
    )
    
    level = Column(
        Integer,
        default=1,
        nullable=False,
        comment="Current user level"
    )
    
    badges = Column(
        JSON,
        nullable=False,
        default=list,
        comment="List of earned badge codes"
    )
    
    achievements = Column(
        JSON,
        nullable=False,
        default=list,
        comment="List of earned achievement codes"
    )
    
    last_activity = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Last time user was active"
    )
    
    # Relationships
    # user = relationship("User", back_populates="gamification")
    
    __table_args__ = (
        CheckConstraint('hearts >= 0 AND hearts <= max_hearts', name='valid_hearts'),
        CheckConstraint('total_xp >= 0', name='valid_xp'),
        CheckConstraint('current_streak >= 0', name='valid_current_streak'),
        CheckConstraint('longest_streak >= 0', name='valid_longest_streak'),
    )


class Leaderboard(Base, TimestampMixin):
    '''
    Cached leaderboard snapshots.
    
    Instead of computing leaderboards on every request,
    we periodically snapshot them for performance.
    '''
    
    __tablename__ = "leaderboards"
    
    id = Column(Integer, primary_key=True, index=True)
    
    world_id = Column(
        Integer,
        ForeignKey("worlds.id", ondelete="CASCADE"),
        nullable=True,  # NULL means global leaderboard
        index=True
    )
    
    period_type = Column(
        String(20),
        nullable=False,
        comment="daily, weekly, monthly, all-time"
    )
    
    snapshot_date = Column(
        Date,
        nullable=False,
        index=True,
        comment="Date of this snapshot"
    )
    
    entries_json = Column(
        JSON,
        nullable=False,
        default=list,
        comment="Leaderboard entries [{user_id, username, xp, rank}]"
    )
    
    __table_args__ = (
        UniqueConstraint('world_id', 'period_type', 'snapshot_date', 
                        name='unique_leaderboard_snapshot'),
        Index('ix_leaderboard_lookup', 'world_id', 'period_type', 'snapshot_date'),
    )
