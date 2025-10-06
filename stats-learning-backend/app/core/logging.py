'''
Logging Configuration

Sets up structured logging for the application.
'''

import logging
import sys
from pathlib import Path
import json
from datetime import datetime

from app.core.config import settings


class JSONFormatter(logging.Formatter):
    '''
    Custom JSON formatter for structured logging.
    
    Outputs logs in JSON format for easier parsing by
    log aggregation systems (ELK stack, CloudWatch, etc.)
    '''
    
    def format(self, record):
        '''Format log record as JSON'''
        log_obj = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        
        # Add exception info if present
        if record.exc_info:
            log_obj['exception'] = self.formatException(record.exc_info)
        
        # Add extra fields if present
        if hasattr(record, 'user_id'):
            log_obj['user_id'] = record.user_id
        if hasattr(record, 'request_id'):
            log_obj['request_id'] = record.request_id
        
        return json.dumps(log_obj)


def setup_logging():
    '''
    Configure logging for the application.
    
    Sets up console and file logging with appropriate formatters
    based on environment settings.
    '''
    # Get root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, settings.LOG_LEVEL))
    
    # Remove default handlers
    root_logger.handlers = []
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    
    if settings.LOG_FORMAT == "json":
        console_handler.setFormatter(JSONFormatter())
    else:
        console_handler.setFormatter(
            logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
        )
    
    root_logger.addHandler(console_handler)
    
    # File handler (if configured)
    if settings.LOG_FILE:
        log_file = Path(settings.LOG_FILE)
        log_file.parent.mkdir(parents=True, exist_ok=True)
        
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(JSONFormatter())
        root_logger.addHandler(file_handler)
