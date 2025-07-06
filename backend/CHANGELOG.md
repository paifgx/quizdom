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

### Changed
- `GET /v1/auth/me` response format changed from `UserResponse` to `UserProfileResponse`
- Soft-deleted users now receive 401 Unauthorized on all authentication attempts

### Security
- Deleted accounts cannot authenticate or access any protected endpoints
- All refresh tokens are revoked upon account deletion
- Audit logs track account deletion events
