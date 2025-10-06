'''
Main Application Entry Point

FastAPI application initialization and configuration.
'''

from contextlib import asynccontextmanager
import logging
from typing import Any, Dict

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.api.v1.api import api_router
from app.db.init_db import init_db
from app.core.logging import setup_logging

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    '''
    Lifespan context manager for startup and shutdown events.
    
    Runs initialization code when app starts and cleanup when it stops.
    '''
    # Startup
    logger.info("Starting up Statistics Learning App Backend...")
    
    # Initialize database (create tables, seed data if needed)
    logger.info("Initializing database...")
    init_db()
    
    # You could add other startup tasks here:
    # - Connect to Redis
    # - Load ML models
    # - Warm up caches
    
    logger.info("Startup complete!")
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")
    # Add cleanup tasks here if needed
    # - Close database connections
    # - Flush caches
    # - Save state
    

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API for Duolingo-style Statistics Learning Application",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
    lifespan=lifespan,
)


# ===========================
# MIDDLEWARE CONFIGURATION
# ===========================

# CORS Middleware - Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  # Which origins can access
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,  # Allow cookies
    allow_methods=settings.CORS_ALLOW_METHODS,  # Which HTTP methods
    allow_headers=settings.CORS_ALLOW_HEADERS,  # Which headers
)

# Trusted Host Middleware - Prevent host header attacks
if settings.ENVIRONMENT == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*.yourdomain.com", "yourdomain.com"]
    )


# ===========================
# EXCEPTION HANDLERS
# ===========================

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    '''
    Handle HTTP exceptions with consistent format.
    '''
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "status_code": exc.status_code
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    '''
    Handle validation errors with detailed feedback.
    
    Makes it easier for frontend developers to understand what went wrong.
    '''
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(x) for x in error["loc"][1:]),  # Skip 'body'
            "message": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": "Validation failed",
            "details": errors
        }
    )


# ===========================
# ROOT ENDPOINTS
# ===========================

@app.get("/", tags=["Root"])
async def root() -> Dict[str, Any]:
    '''
    Root endpoint - API information.
    '''
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health", tags=["Root"])
async def health_check() -> Dict[str, Any]:
    '''
    Health check endpoint.
    
    Used by load balancers and monitoring systems to verify
    the application is running and responsive.
    '''
    # You could add more sophisticated health checks here:
    # - Database connectivity
    # - Redis connectivity
    # - Disk space
    # - Memory usage
    
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT
    }


# ===========================
# INCLUDE API ROUTERS
# ===========================

# Include all API routes
app.include_router(api_router, prefix="/api/v1")


# ===========================
# ERROR HANDLING FOR 404
# ===========================

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    '''
    Custom 404 handler with helpful message.
    '''
    return JSONResponse(
        status_code=404,
        content={
            "success": False,
            "error": "Endpoint not found",
            "message": f"The path {request.url.path} does not exist",
            "available_docs": "/docs"
        }
    )
