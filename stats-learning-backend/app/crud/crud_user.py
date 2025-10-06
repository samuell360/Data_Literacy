'''
User CRUD Operations

Create, Read, Update, Delete operations for User model.
'''

from typing import Optional, cast
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.crud.base import CRUDBase
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    '''CRUD operations for User model'''
    
    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        '''
        Get user by email address.
        
        Args:
            db: Database session
            email: Email address
            
        Returns:
            User instance or None if not found
        '''
        return db.query(User).filter(User.email == email).first()
    
    def get_by_username(self, db: Session, *, username: str) -> Optional[User]:
        '''
        Get user by username.
        
        Args:
            db: Database session
            username: Username
            
        Returns:
            User instance or None if not found
        '''
        return db.query(User).filter(User.username == username).first()
    
    def get_by_email_or_username(self, db: Session, *, email_or_username: str) -> Optional[User]:
        '''
        Get user by email or username.
        
        Args:
            db: Database session
            email_or_username: Email address or username
            
        Returns:
            User instance or None if not found
        '''
        return db.query(User).filter(
            or_(User.email == email_or_username, User.username == email_or_username)
        ).first()
    
    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        '''
        Create new user with hashed password.
        
        Args:
            db: Database session
            obj_in: User creation data
            
        Returns:
            Created user instance
        '''
        create_data = obj_in.dict()
        create_data.pop("password")
        db_obj = User(
            **create_data,
            hashed_password=get_password_hash(obj_in.password)
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def authenticate(self, db: Session, *, email_or_username: str, password: str) -> Optional[User]:
        '''
        Authenticate user with email/username and password.
        
        Args:
            db: Database session
            email_or_username: Email address or username
            password: Plain text password
            
        Returns:
            User instance if authentication successful, None otherwise
        '''
        user = self.get_by_email_or_username(db, email_or_username=email_or_username)
        if not user:
            return None
        if not verify_password(password, cast(str, user.hashed_password)):
            return None
        return user
    
    def is_active(self, user: User) -> bool:
        '''Check if user is active'''
        return cast(bool, user.is_active)
    
    def is_admin(self, user: User) -> bool:
        '''Check if user is admin'''
        return cast(bool, user.is_admin)
    
    def update_login(self, db: Session, *, user: User) -> User:
        '''
        Update user login information.
        
        Args:
            db: Database session
            user: User instance
            
        Returns:
            Updated user instance
        '''
        from datetime import datetime
        
        setattr(user, "last_login", datetime.utcnow())
        current_login_count = getattr(user, "login_count", 0) or 0
        setattr(user, "login_count", int(current_login_count) + 1)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user


# Create instance for dependency injection
user = CRUDUser(User)