# ERM Implementation Migration Guide

This document outlines the changes made to implement the Entity Relationship Model (ERM) defined in `docs/erm.md`.

## Completed Changes

### 1. Database Models (`app/db/models.py`)

#### New Models Added:
- **UserRoles**: Many-to-many relationship between Users and Roles
- **Wallet**: User wallet for wisecoins
- **EmailTokens**: Tokens for email verification and password reset
- **AuditLogs**: Audit logs for tracking user actions
- **SessionPlayers**: Players in a game session (supports multiplayer)
- **QuestionMedia**: Media files associated with questions
- **UserQuestionStar**: Starred questions by users

#### Model Updates:
- **User**: 
  - Added `nickname` field
  - Removed direct `role_id` field (now uses UserRoles)
- **GameSession**: 
  - Removed `user_id` and `score` fields (moved to SessionPlayers)
- **GameMode**: 
  - Changed enum values: `COMP` (competitive) and `COLLAB` (collaborative) instead of `DUEL` and `TEAM`
- **PlayerAnswer**: 
  - Added `answer_time_ms` field
  - Changed `game_session_id` to `session_id`

### 2. Authentication (`app/routers/auth.py`)
- Updated `get_user_with_role` to query roles through UserRoles table
- Modified role lookups to use the many-to-many relationship

### 3. User Management (`app/routers/user.py`)
- Updated `require_admin` to check admin role through UserRoles
- Modified user creation to add UserRoles entries
- Updated user statistics queries to use SessionPlayers

### 4. Database Helpers (`app/db/helpers.py`)
- Updated `get_user_with_role_name` to use UserRoles
- Modified `get_user_quiz_statistics` to query SessionPlayers
- Updated `get_user_last_session` to join through SessionPlayers

### 5. Database Seeding (`app/db/seed.py`)
- Updated user creation to assign roles through UserRoles
- Added nickname field to test users

## Pending Tasks

### 1. Database Migration
Create an Alembic migration to:
- Create new tables (user_roles, wallet, email_tokens, audit_logs, session_players, question_media, user_question_star)
- Migrate existing role data from user.role_id to user_roles table
- Migrate existing game session data to session_players
- Drop the role_id column from users table

### 2. Fix Remaining Issues
- Resolve SQLModel/SQLAlchemy syntax issues in queries (desc(), is_(), etc.)
- Fix type annotation errors
- Update all remaining references to old model structure

### 3. Update API Schemas
- Ensure all Pydantic schemas match the new model structure
- Update response models to handle the new relationships

### 4. Test Updates
- Update all tests to work with the new model structure
- Add tests for new models and relationships

### 5. Frontend Updates
- Update API calls to handle the new data structure
- Modify user management UI to work with role assignments

## Breaking Changes

1. **User Roles**: Direct role_id on User model no longer exists
2. **Game Sessions**: user_id and score moved to SessionPlayers
3. **Game Modes**: DUEL → COMP, TEAM → COLLAB
4. **Player Answers**: game_session_id → session_id

## Migration Steps

1. Backup the database
2. Run the migration script (to be created)
3. Update all API clients to handle the new structure
4. Test all functionality thoroughly

## Notes

- The Quiz and QuizQuestion models remain in the codebase but are not part of the ERM
- All user-facing messages should be in German (as per backend rules)
- The system now properly supports multiplayer game sessions through SessionPlayers 