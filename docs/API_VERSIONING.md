# API Versioning Structure

## Overview
All public API endpoints now use consistent `/v1/` prefixes following the cursor rules conventions.

## Router Structure

### Authentication (`/v1/auth/`)
- **File**: `app/routers/auth.py`
- **Prefix**: `/v1/auth`
- **Tags**: `["auth"]`
- **Endpoints**:
  - `POST /v1/auth/register` - User registration
  - `POST /v1/auth/login` - User login (OAuth2 token endpoint)
  - `GET /v1/auth/me` - Get current user info

### Quiz Game (`/v1/quiz/`)
- **File**: `app/routers/quiz.py`
- **Prefix**: `/v1/quiz`
- **Tags**: `["quiz"]`
- **Endpoints**:
  - `POST /v1/quiz/session/create` - Create game session
  - `GET /v1/quiz/session/{session_id}/question/current` - Get current question
  - `POST /v1/quiz/session/{session_id}/answer` - Submit answer
  - `POST /v1/quiz/session/{session_id}/next` - Next question
  - `WebSocket /v1/quiz/session/{session_id}/ws/{player_id}` - Real-time game updates

### User Management (`/v1/users/`)
- **File**: `app/routers/user.py`
- **Prefix**: `/v1/users`
- **Tags**: `["users"]`
- **Endpoints**:
  - `GET /v1/users/users` - List users (admin only)
  - `POST /v1/users/users` - Create user (admin only)
  - `GET /v1/users/users/stats` - User statistics (admin only)
  - `GET /v1/users/users/{user_id}` - Get user by ID (admin only)
  - `PUT /v1/users/users/{user_id}` - Update user (admin only)
  - `DELETE /v1/users/users/{user_id}` - Delete user (admin only)
  - `PUT /v1/users/users/{user_id}/status` - Update user status (admin only)
  - `GET /v1/users/roles` - List roles (admin only)

### Quiz Administration (`/v1/admin/quiz/`)
- **File**: `app/routers/admin_router.py`
- **Prefix**: `/v1/admin/quiz`
- **Tags**: `["admin-quiz"]`
- **Endpoints**:
  - `GET /v1/admin/quiz/topics` - List topics
  - `POST /v1/admin/quiz/topics` - Create topic
  - `GET /v1/admin/quiz/topics/{topic_id}` - Get topic
  - `PUT /v1/admin/quiz/topics/{topic_id}` - Update topic
  - `DELETE /v1/admin/quiz/topics/{topic_id}` - Delete topic
  - `GET /v1/admin/quiz/questions` - List questions
  - `POST /v1/admin/quiz/questions` - Create question
  - `GET /v1/admin/quiz/questions/{question_id}` - Get question
  - `PUT /v1/admin/quiz/questions/{question_id}` - Update question
  - `DELETE /v1/admin/quiz/questions/{question_id}` - Delete question
  - `GET /v1/admin/quiz/quizzes` - List quizzes
  - `POST /v1/admin/quiz/quizzes` - Create quiz
  - `POST /v1/admin/quiz/quizzes/batch` - Create quiz batch
  - `GET /v1/admin/quiz/quizzes/{quiz_id}` - Get quiz
  - `PUT /v1/admin/quiz/quizzes/{quiz_id}` - Update quiz
  - `DELETE /v1/admin/quiz/quizzes/{quiz_id}` - Delete quiz

## Non-Versioned Endpoints

### Health Check
- `GET /` - API health status

### Documentation (Auto-generated)
- `GET /docs` - Swagger UI
- `GET /redoc` - ReDoc UI
- `GET /openapi.json` - OpenAPI schema

## Implementation Details

### Router Configuration
Each router follows the cursor rules pattern:
```python
router = APIRouter(prefix="/v1/<resource>", tags=["<resource>"])
```

### Main App Configuration
```python
# Clean router includes without redundant prefixes
app.include_router(auth.router)
app.include_router(quiz.router)
app.include_router(user.router)
app.include_router(admin_router)
```

### OAuth2 Token URL
Updated to match new auth endpoint:
```python
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="v1/auth/login")
```

## Migration Notes

### Breaking Changes
- **Auth endpoints**: `/auth/*` → `/v1/auth/*`
- **Quiz endpoints**: `/quiz/*` → `/v1/quiz/*`
- **User admin endpoints**: `/v1/admin/*` → `/v1/users/*`
- **Quiz admin endpoints**: `/v1/admin/*` → `/v1/admin/quiz/*`

### Frontend Updates Required
Frontend applications need to update their API base URLs:
- Authentication calls: `api/auth/login` → `api/v1/auth/login`
- Quiz game calls: `api/quiz/session/create` → `api/v1/quiz/session/create`
- WebSocket connections: `ws://host/quiz/session/{id}/ws/{player}` → `ws://host/v1/quiz/session/{id}/ws/{player}`
- Admin calls: Update to new user management and quiz admin paths

## Benefits

1. **Consistency**: All public endpoints follow the same versioning pattern
2. **Future-proofing**: Easy to add v2, v3, etc. when breaking changes are needed
3. **Clear separation**: User management and quiz administration are clearly separated
4. **Standards compliance**: Follows REST API versioning best practices
5. **Client compatibility**: Clients can specify which API version they support
