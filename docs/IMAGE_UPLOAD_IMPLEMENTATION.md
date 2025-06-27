# Quiz Image Upload Implementation

This document describes the implementation of file upload functionality for quiz images, replacing the previous URL-based approach.

## Changes Made

### Backend Changes

#### 1. Database Model Updates
- **File**: `backend/app/db/models.py`
- **Changes**: Added new fields to the `Quiz` model:
  - `image_data: Optional[bytes]` - Stores binary image data
  - `image_filename: Optional[str]` - Stores original filename

#### 2. Database Migration
- **File**: `backend/add_image_fields.sql`
- **Changes**: Added the new columns to the existing database
- **Execute**: Run `python -c "from app.db.session import engine; from sqlmodel import text; conn = engine.connect(); conn.execute(text('ALTER TABLE quiz ADD COLUMN IF NOT EXISTS image_data BYTEA')); conn.execute(text('ALTER TABLE quiz ADD COLUMN IF NOT EXISTS image_filename VARCHAR(255)')); conn.commit(); print('Migration completed!')"` from the backend directory

#### 3. Schema Updates
- **File**: `backend/app/schemas/quiz_admin.py`
- **Changes**:
  - Added `has_image: bool` field to `QuizResponse` to indicate if quiz has an image
  - Added `ImageUploadResponse` schema for image upload responses

#### 4. Service Layer Updates
- **File**: `backend/app/services/quiz_admin_service.py`
- **Changes**: Added three new methods:
  - `upload_quiz_image(quiz_id, image_data, filename)` - Uploads and stores image
  - `get_quiz_image(quiz_id)` - Retrieves image data and filename
  - `delete_quiz_image(quiz_id)` - Removes image from quiz
  - Updated quiz response methods to include `has_image` field

#### 5. API Endpoints
- **File**: `backend/app/routers/admin_router.py`
- **Changes**: Added three new endpoints:
  - `POST /v1/admin/quiz/quizzes/{quiz_id}/image` - Upload image
  - `GET /v1/admin/quiz/quizzes/{quiz_id}/image` - Retrieve image
  - `DELETE /v1/admin/quiz/quizzes/{quiz_id}/image` - Delete image

### Frontend Changes

#### 1. Quiz Edit Form Updates
- **File**: `frontend/app/routes/admin.quiz-edit.tsx`
- **Changes**:
  - Replaced URL input field with file upload input
  - Added image preview functionality
  - Added file validation (type and size limits)
  - Added image removal functionality
  - Added support for existing image display and removal
  - Updated form submission to handle file uploads

## Usage

### For Administrators

1. **Creating a Quiz with Image**:
   - Navigate to the quiz creation form
   - Fill in the basic quiz information
   - Use the "Bild hochladen" field to select an image file
   - The image will be validated and show a preview
   - Submit the form to create the quiz with the image

2. **Editing a Quiz Image**:
   - Open an existing quiz for editing
   - If the quiz already has an image, it will be displayed
   - Use the "Bild hochladen" field to replace the image
   - Use the delete button to remove the existing image
   - Submit the form to save changes

3. **Image Requirements**:
   - Supported formats: JPG, PNG, GIF, WebP
   - Maximum file size: 5MB
   - Images are stored as binary data in the database

### For Developers

#### API Usage

```bash
# Upload an image to a quiz
curl -X POST \
  http://localhost:8000/v1/admin/quiz/quizzes/1/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@path/to/image.jpg"

# Retrieve a quiz image
curl -X GET \
  http://localhost:8000/v1/admin/quiz/quizzes/1/image \
  -H "Authorization: Bearer YOUR_TOKEN"

# Delete a quiz image
curl -X DELETE \
  http://localhost:8000/v1/admin/quiz/quizzes/1/image \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Frontend Integration

The frontend now includes:
- File upload with drag-and-drop support
- Image preview with metadata display
- File validation and error handling
- Support for existing image management

## Security Considerations

1. **File Type Validation**: Only image files are accepted
2. **File Size Limits**: Maximum 5MB per image
3. **Authentication**: All endpoints require admin authentication
4. **Binary Storage**: Images are stored as BYTEA in PostgreSQL

## Performance Considerations

1. **Storage**: Images are stored in the database as binary data
   - Consider implementing file system storage for better performance at scale
   - Current approach is suitable for moderate usage

2. **Transfer**: Images are transferred as binary data in HTTP responses
   - Consider implementing CDN or caching for production use

## Migration from URL-based Images

The `imageUrl` fields in the TypeScript types are kept for backward compatibility, but the new implementation uses the file upload approach. The form will:

1. Display existing images (if any) when editing
2. Allow uploading new images to replace existing ones
3. Allow removing existing images
4. Handle both new quiz creation and existing quiz editing

## Future Enhancements

1. **Image Optimization**: Implement automatic image resizing/compression
2. **Multiple Images**: Support for multiple images per quiz
3. **CDN Integration**: Move to external storage service for better performance
4. **Image Formats**: Additional format support (SVG, etc.)
5. **Bulk Operations**: Bulk image upload/management tools
