"""Tests for security utilities."""

from datetime import datetime, timedelta, timezone

from jose import jwt

from app.core.security import (
    ALGORITHM,
    SECRET_KEY,
    TokenData,
    create_access_token,
    get_password_hash,
    verify_password,
    verify_token,
)


class TestPasswordOperations:
    """Test password hashing and verification."""

    def test_password_hash_is_generated(self):
        """Test that password hash is generated."""
        password = "test_password_123"
        hashed = get_password_hash(password)

        assert hashed is not None
        assert hashed != password
        assert len(hashed) > 20  # Bcrypt hashes are typically 60 characters

    def test_password_verification_success(self):
        """Test successful password verification."""
        password = "test_password_123"
        hashed = get_password_hash(password)

        assert verify_password(password, hashed) is True

    def test_password_verification_failure(self):
        """Test failed password verification."""
        password = "test_password_123"
        wrong_password = "wrong_password_456"
        hashed = get_password_hash(password)

        assert verify_password(wrong_password, hashed) is False

    def test_different_passwords_generate_different_hashes(self):
        """Test that same password generates different hashes (salt effect)."""
        password = "same_password"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)

        assert hash1 != hash2
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True


class TestJWTTokenOperations:
    """Test JWT token creation and verification."""

    def test_create_access_token_with_default_expiration(self):
        """Test creating access token with default expiration."""
        data = {"sub": "test@example.com"}
        token = create_access_token(data)

        assert token is not None
        assert isinstance(token, str)

        # Verify token can be decoded
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert payload["sub"] == "test@example.com"
        assert "exp" in payload

    def test_create_access_token_with_custom_expiration(self):
        """Test creating access token with custom expiration."""
        data = {"sub": "test@example.com"}
        expires_delta = timedelta(minutes=30)
        token = create_access_token(data, expires_delta)

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        exp_time = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        current_time = datetime.now(timezone.utc)

        # Check that expiration is approximately 30 minutes from now
        time_diff = exp_time - current_time
        assert 29 <= time_diff.total_seconds() / 60 <= 31

    def test_verify_token_success(self):
        """Test successful token verification."""
        email = "test@example.com"
        data = {"sub": email}
        token = create_access_token(data)

        token_data = verify_token(token)

        assert token_data is not None
        assert isinstance(token_data, TokenData)
        assert token_data.email == email

    def test_verify_token_invalid_signature(self):
        """Test token verification with invalid signature."""
        # Create token with wrong secret
        data = {"sub": "test@example.com"}
        token = jwt.encode(data, "wrong_secret", algorithm=ALGORITHM)

        token_data = verify_token(token)
        assert token_data is None

    def test_verify_token_expired(self):
        """Test token verification with expired token."""
        data = {"sub": "test@example.com"}
        # Create token that's already expired
        expires_delta = timedelta(seconds=-1)
        token = create_access_token(data, expires_delta)

        token_data = verify_token(token)
        assert token_data is None

    def test_verify_token_malformed(self):
        """Test token verification with malformed token."""
        malformed_token = "not.a.valid.jwt.token"

        token_data = verify_token(malformed_token)
        assert token_data is None

    def test_verify_token_missing_subject(self):
        """Test token verification with missing subject."""
        data = {"user": "test@example.com"}  # Wrong key
        token = jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

        token_data = verify_token(token)
        assert token_data is None

    def test_verify_token_non_string_subject(self):
        """Test token verification with non-string subject."""
        data = {"sub": 12345}  # Number instead of string
        token = jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

        token_data = verify_token(token)
        assert token_data is None


class TestTokenData:
    """Test TokenData model."""

    def test_token_data_creation(self):
        """Test TokenData creation."""
        email = "test@example.com"
        token_data = TokenData(email=email)

        assert token_data.email == email

    def test_token_data_optional_email(self):
        """Test TokenData with optional email."""
        token_data = TokenData()

        assert token_data.email is None
