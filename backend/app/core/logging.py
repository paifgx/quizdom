"""Logging configuration for structured application logging.

This module provides centralized logging setup with proper formatting
and context tracking for debugging and monitoring purposes.
"""

import logging
import sys
from typing import Any


def setup_logging() -> logging.Logger:
    """Configure application logging with structured format.

    Sets up logging with timestamps, levels, and structured output
    for both development and production environments.
    """
    # Create logger
    logger = logging.getLogger("quizdom")
    logger.setLevel(logging.INFO)

    # Avoid duplicate handlers
    if logger.handlers:
        return logger

    # Create console handler with formatting
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.INFO)

    # Create formatter
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    handler.setFormatter(formatter)

    logger.addHandler(handler)
    return logger


def log_operation(logger: logging.Logger, operation: str, **context: Any) -> None:
    """Log operation with context for debugging and monitoring.

    Provides structured logging of operations with relevant context
    such as user IDs, parameters, and operation results.
    """
    context_str = " | ".join(f"{k}={v}" for k, v in context.items())
    logger.info(f"Operation: {operation} | {context_str}")


def log_error(
    logger: logging.Logger, operation: str, error: Exception, **context: Any
) -> None:
    """Log error with operation context and exception details.

    Captures error information with operation context for debugging
    and monitoring of application failures.
    """
    context_str = " | ".join(f"{k}={v}" for k, v in context.items())
    logger.error(f"Error in {operation}: {str(error)} | {context_str}")


# Global logger instance
app_logger = setup_logging()
