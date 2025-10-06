'''
Authentication Routes

User registration, login, and authentication endpoints.
'''

from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, validate_password_strength
from app.core.deps import get_current_active_user
from app.crud.crud_user import user as crud_user
from app.models.user import User
from app.schemas.user import (
    UserRegister, UserLogin, LoginResponse, Token, UserResponse,
    PasswordValidation
)
from app.services.auth_service import bootstrap_new_user, bootstrap_returning_user

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserRegister
) -> Any:
    '''
    Register a new user.
    
    Creates a new user account with the provided information.
    '''
    # Check if user already exists
    user = crud_user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )
    
    user = crud_user.get_by_username(db, username=user_in.username)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this username already exists"
        )
    
    # Validate password strength
    password_validation = validate_password_strength(user_in.password)
    if not password_validation["valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Password does not meet requirements",
                "errors": password_validation["errors"]
            }
        )
    
    # Create user
    from app.schemas.user import UserCreate
    user_create = UserCreate(
        email=user_in.email,
        username=user_in.username,
        password=user_in.password,
        full_name=user_in.full_name,
        is_admin=False
    )
    
    user = crud_user.create(db, obj_in=user_create)
    
    # Bootstrap new user with initial state
    bootstrap_new_user(db, user)
    
    return UserResponse.model_validate(user)


@router.post("/login", response_model=LoginResponse)
async def login(
    *,
    db: Session = Depends(get_db),
    user_credentials: UserLogin
) -> Any:
    '''
    User login with email/username and password.
    
    Returns JWT access token and user information.
    '''
    # Authenticate user
    user = crud_user.authenticate(
        db,
        email_or_username=user_credentials.email_or_username,
        password=user_credentials.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password"
        )
    
    if not crud_user.is_active(user):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )
    
    # Update login information
    user = crud_user.update_login(db, user=user)
    
    # Bootstrap returning user
    bootstrap_returning_user(db, user)
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "username": user.username},
        expires_delta=access_token_expires
    )
    
    # Create token response
    token = Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convert to seconds
        user=UserResponse.model_validate(user)
    )
    
    return LoginResponse(
        message="Login successful",
        token=token,
        login_count=user.login_count
    )


@router.post("/validate-password", response_model=PasswordValidation)
async def validate_password(
    password: str
) -> Any:
    '''
    Validate password strength.
    
    Checks if password meets the configured requirements.
    '''
    return validate_password_strength(password)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
) -> Any:
    '''
    Get current user information.
    
    Returns the authenticated user's profile information.
    '''
    return current_user


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_active_user)
) -> Any:
    '''
    User logout.
    
    Note: Since we're using stateless JWT tokens, logout is handled client-side
    by removing the token. This endpoint exists for consistency.
    '''
    return {
        "message": "Logout successful",
        "detail": "Please remove the access token from your client"
    }


@router.get("/verify-token")
async def verify_token(
    current_user: User = Depends(get_current_active_user)
) -> Any:
    '''
    Verify if the current token is valid.
    
    Returns user information if token is valid.
    '''
    return {
        "valid": True,
        "user": UserResponse.model_validate(current_user),
        "message": "Token is valid"
    }
