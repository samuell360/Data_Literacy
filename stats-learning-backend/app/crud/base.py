'''
Base CRUD Operations

Generic CRUD operations that other CRUD classes inherit from.
'''

from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.db.base import Base

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    '''
    Base class for CRUD operations.
    
    Provides generic Create, Read, Update, Delete operations
    that can be inherited by specific model CRUD classes.
    '''
    
    def __init__(self, model: Type[ModelType]):
        '''
        Initialize CRUD object with SQLAlchemy model.
        
        Args:
            model: SQLAlchemy model class
        '''
        self.model = model
    
    def get(self, db: Session, id: Any) -> Optional[ModelType]:
        '''
        Get a single record by ID.
        
        Args:
            db: Database session
            id: Record ID
            
        Returns:
            Model instance or None if not found
        '''
        return db.query(self.model).filter(self.model.id == id).first()
    
    def get_multi(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[List] = None
    ) -> List[ModelType]:
        '''
        Get multiple records with pagination.
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            filters: Optional SQLAlchemy filter conditions
            
        Returns:
            List of model instances
        '''
        query = db.query(self.model)
        
        if filters:
            query = query.filter(and_(*filters))
        
        return query.offset(skip).limit(limit).all()
    
    def create(self, db: Session, *, obj_in: CreateSchemaType) -> ModelType:
        '''
        Create a new record.
        
        Args:
            db: Database session
            obj_in: Pydantic schema with creation data
            
        Returns:
            Created model instance
        '''
        obj_in_data = obj_in.dict()
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update(
        self,
        db: Session,
        *,
        db_obj: ModelType,
        obj_in: Union[UpdateSchemaType, Dict[str, Any]]
    ) -> ModelType:
        '''
        Update an existing record.
        
        Args:
            db: Database session
            db_obj: Existing model instance
            obj_in: Pydantic schema or dict with update data
            
        Returns:
            Updated model instance
        '''
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def remove(self, db: Session, *, id: int) -> ModelType:
        '''
        Delete a record by ID.
        
        Args:
            db: Database session
            id: Record ID
            
        Returns:
            Deleted model instance
        '''
        obj = db.query(self.model).get(id)
        db.delete(obj)
        db.commit()
        return obj
    
    def count(self, db: Session, *, filters: Optional[List] = None) -> int:
        '''
        Count records matching filters.
        
        Args:
            db: Database session
            filters: Optional SQLAlchemy filter conditions
            
        Returns:
            Count of matching records
        '''
        query = db.query(self.model)
        
        if filters:
            query = query.filter(and_(*filters))
        
        return query.count()
