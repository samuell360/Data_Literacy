'''
Authentication Schemas

Pydantic models for authentication requests and responses.
'''

from typing import Optional
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, validator, ConfigDict


class LoginRequest(BaseModel):
    '''
    Login request schema.
    
    Accepts either email or username for flexibility.
    '''
    email_or_username: str = Field(
        ...,
        description="Email address or username"
    )
    password: str = Field(
        ...,
        min_length=1,
        description="User password"
    )
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email_or_username": "user@example.com",
                "password": "MySecurePassword123!"
            }
        }
    )


class RegisterRequest(BaseModel):
    '''
    Registration request schema.
    
    All fields required for new user creation.
    '''
    email: EmailStr = Field(
        ...,
        description="Valid email address"
    )
    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
        pattern="^[a-zA-Z0-9_-]+$",
        description="Username (alphanumeric, underscore, hyphen only)"
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=100,
        description="Strong password"
    )
    full_name: Optional[str] = Field(
        None,
        max_length=100,
        description="Full name (optional)"
    )
    
    @validator('username')
    def validate_username(cls, v):
        '''Ensure username doesn't start with numbers'''
        if v and v[0].isdigit():
            raise ValueError("Username cannot start with a number")
        return v
    
    @validator('password')
    def validate_password(cls, v):
        '''Basic password strength validation'''
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(char.isupper() for char in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(char.islower() for char in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(char.isdigit() for char in v):
            raise ValueError("Password must contain at least one digit")
        return v
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "newuser@example.com",
                "username": "learner123",
                "password": "SecurePass123!",
                "full_name": "John Doe"
            }
        }
    )


class TokenResponse(BaseModel):
    '''JWT token response'''
    access_token: str
    token_type: str = "Bearer"
    expires_in: int  # Seconds until expiration


class SessionResponse(BaseModel):
    '''Session creation response'''
    session_id: str
    user_id: int
    expires_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class PasswordResetRequest(BaseModel):
    '''Request password reset'''
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    '''Confirm password reset with token'''
    token: str
    new_password: str = Field(..., min_length=8)


class EmailVerificationRequest(BaseModel):
    '''Request email verification'''
    email: EmailStr


class EmailVerificationConfirm(BaseModel):
    '''Confirm email with token'''
    token: str
