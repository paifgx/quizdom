from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from typing import List
import os
from pathlib import Path

# Email configuration
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", ""),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", ""),
    MAIL_FROM=os.getenv("MAIL_FROM", ""),
    MAIL_PORT=int(os.getenv("MAIL_PORT", "587")),
    MAIL_SERVER=os.getenv("MAIL_SERVER", ""),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    TEMPLATE_FOLDER=Path(__file__).parent.parent / 'templates'
)

async def send_verification_email(email: EmailStr, token: str, base_url: str):
    """Send verification email to user."""
    verification_link = f"{base_url}/verify-email?token={token}"
    
    message = MessageSchema(
        subject="Verify your email address",
        recipients=[email],
        body=f"""
        Welcome to our platform!
        
        Please verify your email address by clicking the link below:
        {verification_link}
        
        This link will expire in 24 hours.
        
        If you didn't create this account, please ignore this email.
        """,
        subtype="html"
    )
    
    fm = FastMail(conf)
    await fm.send_message(message)

async def send_reset_password_email(email: EmailStr, token: str, base_url: str):
    """Send password reset email to user."""
    reset_link = f"{base_url}/reset-password?token={token}"
    
    message = MessageSchema(
        subject="Reset your password",
        recipients=[email],
        body=f"""
        You have requested to reset your password.
        
        Click the link below to reset your password:
        {reset_link}
        
        This link will expire in 24 hours.
        
        If you didn't request this, please ignore this email.
        """,
        subtype="html"
    )
    
    fm = FastMail(conf)
    await fm.send_message(message) 