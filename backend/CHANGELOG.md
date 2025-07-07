# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **User Profile Management** - New endpoints for user profile operations
  - `GET /v1/auth/me` - Enhanced to return `UserProfileResponse` with complete profile data including stats
  - `PUT /v1/auth/me` - New endpoint to update user profile (nickname, avatar_url, bio)
  - `DELETE /v1/auth/me` - New endpoint for soft account deletion
- **Database Fields** - Added `avatar_url` and `bio` fields to user table
- **Authentication** - Enhanced `get_current_user` to check for soft-deleted accounts
- **feat(admin): allow publishing, archiving, and reactivating quizzes**
  - Admins can now manage the lifecycle of a quiz through dedicated status actions.
  - A quiz must contain at least one question to be published.
  - `GET /v1/admin/quizzes` and `GET /v1/admin/quizzes/{id}` now include the `status`, `published_at`, and `play_count` fields.
  - New endpoints `POST /v1/admin/quizzes/{id}/publish`, `POST /v1/admin/quizzes/{id}/archive`, and `POST /v1/admin/quizzes/{id}/reactivate` are available.

### Changed

- `GET /v1/auth/me` response format changed from `UserResponse` to `UserProfileResponse`
- Soft-deleted users now receive 401 Unauthorized on all authentication attempts
- The `test_user` fixture ID in `conftest.py` was changed to `3` to avoid conflicts.

### Security

- Deleted accounts cannot authenticate or access any protected endpoints
- All refresh tokens are revoked upon account deletion
- Audit logs track account deletion events

### Fixed

- Corrected the table name from `user_roles` to `userroles` in integration tests.
- Added a `clear_db` autouse fixture to ensure test isolation and prevent database state leakage between tests.
- Resolved test failures by mocking `authService` and adding `AuthProvider` to the test environment for components requiring authentication context.

## [0.1.0] - 2024-07-04

### Added

- Initial project structure for Quizdom backend and frontend.
- Basic user authentication endpoints.
- Admin panel for managing users and quizzes.
- WebSocket support for real-time game updates.
- Initial database models and Alembic migrations.
- Unit and integration test setup with Pytest and Vitest.
- Docker configuration for containerized deployment.
- CI/CD pipeline setup with GitHub Actions.
