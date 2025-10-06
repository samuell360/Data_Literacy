'''
Configuration Management

This module handles all application configuration using Pydantic Settings.
It loads values from environment variables and provides type-safe access
throughout the application.
'''

import os
from typing import List, Optional, Union
from pathlib import Path
from functools import lru_cache

from pydantic import EmailStr, field_validator, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[2]
ROOT_DIR = BASE_DIR.parent
DEFAULT_ENV_FILES = [str(ROOT_DIR / ".env"), str(BASE_DIR / ".env")]

class Settings(BaseSettings):
    '''
    Application settings loaded from environment variables.
    
    All settings can be overridden via environment variables.
    See .env.example for documentation of each setting.
    '''
    
    # --- Application Info ---
    APP_NAME: str = "Statistics Learning App"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = Field("development", description="Current environment")
    DEBUG: bool = Field(False, description="Debug mode")
    
    # --- Database Configuration ---
    DATABASE_URL: str = Field(
        "sqlite:///./app.db",
        description="Database connection string"
    )
    
    # Connection pool settings for production
    DB_POOL_SIZE: int = Field(5, description="Database connection pool size")
    DB_MAX_OVERFLOW: int = Field(10, description="Max overflow connections")
    DB_POOL_PRE_PING: bool = Field(True, description="Test connections before using")
    
    # --- Redis Configuration ---
    REDIS_URL: str = Field(
        "redis://localhost:6379/0",
        description="Redis connection string"
    )
    REDIS_DECODE_RESPONSES: bool = Field(True, description="Decode Redis responses to strings")
    
    # --- Security Configuration ---
    SECRET_KEY: str = Field(
        "jb4ETv6yzT94vlkC9VP-lzcCDy9coSpVXUHzP4akGFA",  # Default for development
        description="Secret key for signing tokens (min 32 chars)",
        min_length=32
    )
    ALGORITHM: str = Field("HS256", description="JWT signing algorithm")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(60, description="Token expiry (minutes)")
    
    # Password Requirements
    PASSWORD_MIN_LENGTH: int = Field(8, description="Minimum password length")
    PASSWORD_REQUIRE_UPPERCASE: bool = Field(True, description="Require uppercase letter")
    PASSWORD_REQUIRE_LOWERCASE: bool = Field(True, description="Require lowercase letter")
    PASSWORD_REQUIRE_DIGIT: bool = Field(True, description="Require digit")
    
    # --- Cookie Configuration ---
    SESSION_COOKIE_NAME: str = Field("session", description="Session cookie name")
    SESSION_TTL_SECONDS: int = Field(2592000, description="Session TTL (30 days)")
    COOKIE_DOMAIN: Optional[str] = Field(None, description="Cookie domain")
    COOKIE_SECURE: bool = Field(False, description="Require HTTPS for cookies")
    COOKIE_HTTPONLY: bool = Field(True, description="HttpOnly cookie flag")
    COOKIE_SAMESITE: str = Field("lax", description="SameSite cookie policy")
    
    # --- CORS Configuration ---
    FRONTEND_ORIGIN: str = Field(
        "http://localhost:5174",
        description="Primary frontend origin"
    )
    CORS_ORIGINS: List[str] = Field(
        ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://localhost:5175"],
        description="Allowed CORS origins"
    )
    CORS_ALLOW_CREDENTIALS: bool = Field(True, description="Allow credentials in CORS")
    CORS_ALLOW_METHODS: List[str] = Field(["*"], description="Allowed HTTP methods")
    CORS_ALLOW_HEADERS: List[str] = Field(["*"], description="Allowed headers")
    
    # --- Rate Limiting ---
    RATE_LIMIT_ENABLED: bool = Field(True, description="Enable rate limiting")
    MAX_LOGIN_ATTEMPTS_PER_MINUTE: int = Field(10, description="Max login attempts/min")
    MAX_API_CALLS_PER_MINUTE: int = Field(100, description="Max API calls/min")
    MAX_SIM_RUNS_PER_MINUTE: int = Field(30, description="Max simulation runs/min")
    
    # --- Email Configuration ---
    SMTP_HOST: Optional[str] = Field(None, description="SMTP server host")
    SMTP_PORT: int = Field(587, description="SMTP server port")
    SMTP_USER: Optional[str] = Field(None, description="SMTP username")
    SMTP_PASSWORD: Optional[str] = Field(None, description="SMTP password")
    FROM_EMAIL: Optional[EmailStr] = Field(None, description="Default from email")
    EMAIL_ENABLED: bool = Field(False, description="Enable email sending")
    
    # --- File Upload ---
    MAX_UPLOAD_SIZE: int = Field(10485760, description="Max upload size (10MB)")
    ALLOWED_EXTENSIONS: List[str] = Field(
        [".csv", ".json", ".xlsx", ".xls"],
        description="Allowed file extensions"
    )
    UPLOAD_DIR: Path = Field(Path("uploads"), description="Upload directory")
    
    # --- Simulation Settings ---
    MAX_SIMULATION_TRIALS: int = Field(2000000, description="Max trials per simulation")
    MAX_SIMULATION_REPLICATES: int = Field(10000, description="Max replicates for CLT")
    SIMULATION_TIMEOUT_SECONDS: float = Field(2.0, description="Simulation timeout")
    SIMULATION_CACHE_TTL: int = Field(30, description="Cache TTL for sim results (seconds)")
    
    # --- Gamification ---
    XP_CORRECT_ANSWER: int = Field(10, description="XP for correct answer")
    XP_RUN_SIMULATION: int = Field(5, description="XP for running simulation")
    XP_FIRST_MASTERY: int = Field(20, description="XP for first mastery")
    XP_PERFECT_QUIZ: int = Field(50, description="XP for perfect quiz score")
    
    # --- Feature Flags ---
    ENABLE_REGISTRATION: bool = Field(True, description="Allow new user registration")
    ENABLE_PASSWORD_RESET: bool = Field(True, description="Allow password reset")
    ENABLE_EMAIL_VERIFICATION: bool = Field(False, description="Require email verification")
    ENABLE_LEADERBOARD: bool = Field(True, description="Show leaderboards")
    ENABLE_BADGES: bool = Field(True, description="Award badges")
    
    # --- Admin Settings ---
    DEFAULT_ADMIN_EMAIL: EmailStr = Field(
        "admin@example.com",
        description="Default admin email"
    )
    DEFAULT_ADMIN_PASSWORD: str = Field(
        "changethis123!",
        description="Default admin password (CHANGE IN PRODUCTION!)"
    )
    ADMIN_FORCE_RESET_ON_STARTUP: bool = Field(
        False,
        description="If true, reset default admin password at startup (dev/testing only)"
    )
    
    # --- Logging ---
    LOG_LEVEL: str = Field("INFO", description="Logging level")
    LOG_FORMAT: str = Field("json", description="Log format (json or text)")
    LOG_FILE: Optional[Path] = Field(None, description="Log file path")
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: Union[str, List[str], None]) -> List[str]:
        '''Parse CORS origins from comma-separated string or list'''
        if not value:
            env_value = os.getenv("CORS_ALLOW_ORIGINS")
            if env_value:
                value = env_value
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        if isinstance(value, list):
            return [str(origin).strip() for origin in value if str(origin).strip()]
        return []
    
    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        '''Ensure database URL is valid and normalized.

        If a plain 'postgresql://' URL is provided (which defaults to the
        legacy psycopg2 driver), normalize it to use the modern psycopg
        driver explicitly to avoid ModuleNotFoundError for psycopg2.
        '''
        allowed_schemes = (
            "postgresql://",
            "postgresql+asyncpg://",
            "postgresql+psycopg://",
            "sqlite:///",
        )
        if not v.startswith(allowed_schemes):
            raise ValueError(f"Database URL must use one of: {allowed_schemes}")
        # Normalize to psycopg driver if no driver specified
        if v.startswith("postgresql://"):
            v = "postgresql+psycopg://" + v[len("postgresql://"):]
        return v
    
    @field_validator("ENVIRONMENT")
    @classmethod
    def validate_environment(cls, v: str) -> str:
        '''Validate environment is one of allowed values'''
        allowed = {"development", "staging", "production", "testing"}
        if v not in allowed:
            raise ValueError(f"ENVIRONMENT must be one of: {allowed}")
        return v
    
    model_config = SettingsConfigDict(
        env_file=tuple(DEFAULT_ENV_FILES),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    '''
    Get cached settings instance.
    
    Uses functools.lru_cache to ensure we only create one Settings
    instance and reuse it throughout the application lifetime.
    
    Returns:
        Settings: Application settings singleton
    '''
    return Settings()  # type: ignore


# Create a module-level settings instance for easy import
settings = get_settings()

# Computed properties for convenience
IS_PRODUCTION = settings.ENVIRONMENT == "production"
IS_DEVELOPMENT = settings.ENVIRONMENT == "development"
IS_TESTING = settings.ENVIRONMENT == "testing"
