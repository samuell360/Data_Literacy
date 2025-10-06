'''
Common Pydantic Schemas

Shared schemas used across the application.
'''

from typing import Optional, List, Generic, TypeVar
from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict


# Generic type for pagination
T = TypeVar('T')


class PaginationParams(BaseModel):
    '''
    Pagination parameters for list endpoints.
    
    Usage:
        @app.get("/items")
        def get_items(pagination: PaginationParams = Depends()):
            ...
    '''
    limit: int = Field(
        10,
        ge=1,
        le=100,
        description="Number of items to return"
    )
    offset: int = Field(
        0,
        ge=0,
        description="Number of items to skip"
    )
    
    @property
    def skip(self) -> int:
        '''Alias for offset (some prefer skip)'''
        return self.offset


class PaginatedResponse(BaseModel, Generic[T]):
    '''
    Generic paginated response wrapper.
    
    Usage:
        return PaginatedResponse[UserSchema](
            items=users,
            total=total_count,
            limit=limit,
            offset=offset
        )
    '''
    items: List[T]
    total: int = Field(..., description="Total number of items")
    limit: int = Field(..., description="Items per page")
    offset: int = Field(..., description="Items skipped")
    
    @property
    def has_more(self) -> bool:
        '''Check if there are more pages'''
        return (self.offset + len(self.items)) < self.total
    
    @property
    def page(self) -> int:
        '''Current page number (1-indexed)'''
        if self.limit == 0:
            return 1
        return (self.offset // self.limit) + 1
    
    @property
    def total_pages(self) -> int:
        '''Total number of pages'''
        if self.limit == 0:
            return 1
        return (self.total + self.limit - 1) // self.limit


class HealthCheck(BaseModel):
    '''Health check response'''
    status: str = "ok"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    version: Optional[str] = None
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "ok",
                "timestamp": "2024-01-15T10:30:00Z",
                "version": "0.1.0"
            }
        }
    )


class SuccessResponse(BaseModel):
    '''Generic success response'''
    success: bool = True
    message: Optional[str] = None


class ErrorResponse(BaseModel):
    '''Generic error response'''
    success: bool = False
    error: str
    details: Optional[dict] = None
