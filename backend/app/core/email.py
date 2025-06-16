import os

from fastapi_mail import ConnectionConfig, FastMail, MessageSchema
from pydantic import EmailStr

# Email configuration
conf = ConnectionConfig(
    # info: placeholder e-mail address
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", "no-reply@quizdom.com"),
    # info: placeholder password
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", "test"),
    # info: placeholder e-mail address
    MAIL_FROM=os.getenv("MAIL_FROM", "no-reply@quizdom.com"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", "587")),
    # info: placeholder mail server
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
)

# Send verification email to user


async def send_verification_email(email: EmailStr, token: str, base_url: str):
    verification_link = f"{base_url}/verify-email?token={token}"

    message = MessageSchema(
        subject="Verify your email address",
        recipients=[email],
        body=f"""
        Willkommen bei Quizdom - Rise of the Wise!

        Deine Reise kann gleich beginnen.
        Bitte bestätige deine E-Mail-Adresse, indem du auf den folgenden Link klickst:
        {verification_link}

        Dieser Link läuft in 24 Stunden ab.

        Wenn du dieses Konto nicht angelegt hast, ignoriere diese E-Mail.

        Wir sehen uns im Quizdom!
        Patrik, Marina und Freddy

        --------------------------------

        Welcome to Quizdom - Rise of the Wise!

        Your journey is about to begin.
        Please verify your email address by clicking the link below:
        {verification_link}

        This link will expire in 24 hours.

        If you didn't create this account, please ignore this email.

        See you in Quizdom!
        Patrik, Marina and Freddy
        """,
        subtype="html",
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
        subtype="html",
    )

    fm = FastMail(conf)
    await fm.send_message(message)
