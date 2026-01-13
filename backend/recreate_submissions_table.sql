-- Recreate submissions table with correct column order for database-based file storage
-- Run this in Supabase SQL Editor

-- Drop existing table
DROP TABLE IF EXISTS submissions CASCADE;

-- Recreate with correct column order matching Hibernate's INSERT order
CREATE TABLE submissions (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    deliverable_id BIGINT NOT NULL,
    feedback TEXT,
    file_data BYTEA NOT NULL,
    file_name VARCHAR(512) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(512),
    google_drive_file_id VARCHAR(255),
    is_latest BOOLEAN NOT NULL DEFAULT true,
    status VARCHAR(255) NOT NULL,
    submitted_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    version_number INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT fk_deliverable FOREIGN KEY (deliverable_id) REFERENCES deliverables(id) ON DELETE CASCADE
);

-- Verify the column order
SELECT column_name, data_type, ordinal_position 
FROM information_schema.columns 
WHERE table_name = 'submissions' 
ORDER BY ordinal_position;
