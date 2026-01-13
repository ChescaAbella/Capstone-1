# File Storage Migration - Database-Based Storage

## Overview
This update migrates file storage from the file system to the PostgreSQL database, making the application compatible with ephemeral storage platforms like Render.

## Changes Made

### Backend Changes

#### 1. Submission Entity (`Submission.java`)
- **Removed**: `filePath` field (VARCHAR)
- **Added**: `fileData` field (BYTEA/BLOB) to store file content directly in database
- Files are now stored as byte arrays in the database

#### 2. Submission Service (`SubmissionService.java`)
- **Removed**: File system write operations (`Files.write`)
- **Removed**: UUID-based file name generation
- **Added**: `downloadFile(Long submissionId)` method to retrieve file content from database
- Files are now stored directly in the `submissions` table as BYTEA

#### 3. Submission Controller (`SubmissionController.java`)
- **Added**: New endpoint `GET /api/v1/submissions/{id}/download`
  - Returns file content with proper Content-Type and Content-Disposition headers
  - Supports UTF-8 encoded file names
  - Returns file as downloadable attachment

### Frontend Changes

#### 1. Submission Service (`submissionService.js`)
- **Added**: `downloadFile(submissionId, fileName)` function
  - Fetches file content as Blob
  - Creates temporary download link
  - Triggers browser download with original file name
  - Cleans up temporary resources

#### 2. Deliverable Submit Page (`DeliverableSubmit.jsx`)
- **Added**: Download button in submission details section
- **Modified**: Layout to show both "Download File" and "Submit New Version" buttons side by side
- Users can now download their previously submitted files

#### 3. Manager Submissions Page (`ManagerSubmissions.jsx`)
- **Added**: Download button in submission details panel
- Managers can now download submitted files for review

#### 4. CSS Updates
- **DeliverableSubmit.css**: Added `.submission-actions` and `.download-btn` styles
- **ManagerSubmissions.css**: Added `.download-file-btn` styles
- Buttons feature hover effects and consistent styling

### Database Migration

#### Required SQL Migration
Run the following SQL on your PostgreSQL database:

```sql
-- Add file_data column to store file content
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS file_data BYTEA;

-- Optional: Drop file_path column (only after migrating existing data)
-- ALTER TABLE submissions DROP COLUMN IF EXISTS file_path;
```

**Migration Script**: `backend/database_migration_file_storage.sql`

## Benefits

1. **Render Compatibility**: No need for persistent file storage volumes
2. **Simplified Deployment**: Single database connection handles everything
3. **Data Integrity**: Files stored with submission records (no orphaned files)
4. **Atomic Operations**: File and metadata saved in single transaction
5. **Backup Simplicity**: Database backups include all file content

## API Endpoints

### New Endpoint
- **GET** `/api/v1/submissions/{id}/download`
  - **Authorization**: Requires authentication
  - **Response**: File content with proper headers
  - **Headers**:
    - `Content-Type`: Original file MIME type
    - `Content-Disposition`: `attachment; filename*=UTF-8''<encoded-filename>`

## File Size Considerations

- Maximum file size: 50MB (configurable in `SubmissionService.validateFile()`)
- PostgreSQL BYTEA column can store up to 1GB per row
- Recommended: Monitor database size and adjust limits as needed
- For very large files (>100MB), consider using cloud storage (S3, Azure Blob)

## Testing

1. **Upload Test**:
   - Upload a file through `/member/deliverables/{id}/submit`
   - Verify file is stored in database (check `file_data` column)

2. **Download Test**:
   - Click "Download File" button on existing submission
   - Verify file downloads with correct name and content

3. **Manager Review**:
   - Navigate to `/manager/deliverables`
   - View submissions and download files
   - Verify managers can download submitted files

## Rollback Plan

If you need to revert to file system storage:

1. Restore the old `Submission.java`, `SubmissionService.java`, and `SubmissionController.java`
2. Run SQL: `ALTER TABLE submissions DROP COLUMN file_data;`
3. Ensure `uploads/` directory exists and is writable
4. Remove download functionality from frontend

## Future Enhancements

- Add file preview for images/PDFs
- Implement file versioning with diff viewing
- Add bulk download for multiple submissions
- Consider cloud storage integration for files >50MB
