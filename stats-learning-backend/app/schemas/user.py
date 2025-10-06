'''
User Schemas

Pydantic models for user data validation and serialization.
'''

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    '''Base user schema with common fields'''
    email: EmailStr = Field(..., description="User email address")
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    full_name: Optional[str] = Field(None, max_length=200, description="User's full name")
    bio: Optional[str] = Field(None, description="User biography")
    timezone: str = Field("UTC", description="User's timezone")
    preferred_language: str = Field("en", description="Preferred language code")
    public_profile: bool = Field(True, description="Whether profile is public")
    allow_emails: bool = Field(True, description="Whether to send email notifications")


class UserCreate(UserBase):
    '''Schema for creating a new user'''
    password: str = Field(..., min_length=8, description="User password")
    is_admin: bool = Field(False, description="Whether user has admin privileges")


class UserUpdate(BaseModel):
    '''Schema for updating user information'''
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    full_name: Optional[str] = Field(None, max_length=200)
    bio: Optional[str] = None
    timezone: Optional[str] = None
    preferred_language: Optional[str] = None
    public_profile: Optional[bool] = None
    allow_emails: Optional[bool] = None


class UserResponse(UserBase):
    '''Schema for user response (excludes sensitive data)'''
    id: int
    is_active: bool
    is_verified: bool
    is_admin: bool
    last_login: Optional[datetime]
    login_count: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        orm_mode = True


class UserLogin(BaseModel):
    '''Schema for user login'''
    email_or_username: str = Field(..., description="Email address or username")
    password: str = Field(..., description="User password")


class UserRegister(BaseModel):
    '''Schema for user registration'''
    email: EmailStr = Field(..., description="User email address")
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    password: str = Field(..., min_length=8, description="User password")
    full_name: Optional[str] = Field(None, max_length=200, description="User's full name")


class Token(BaseModel):
    '''Schema for authentication token response'''
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field("bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration time in seconds")
    user: UserResponse = Field(..., description="User information")


class PasswordValidation(BaseModel):
    '''Schema for password validation response'''
    valid: bool = Field(..., description="Whether password is valid")
    errors: list = Field(..., description="List of validation errors")
    strength: str = Field(..., description="Password strength level")


class LoginResponse(BaseModel):
    '''Schema for successful login response'''
    message: str = Field("Login successful", description="Success message")
    token: Token = Field(..., description="Authentication token and user data")
    login_count: int = Field(..., description="User's total login count")