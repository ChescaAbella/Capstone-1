-- Fix column order by swapping file_name and file_data positions
-- Run this in Supabase SQL Editor

-- Step 1: Add temporary columns
ALTER TABLE submissions ADD COLUMN temp_file_data BYTEA;
ALTER TABLE submissions ADD COLUMN temp_file_name VARCHAR(512);

-- Step 2: Copy data to temp columns
UPDATE submissions 
SET temp_file_data = file_data, 
    temp_file_name = file_name;

-- Step 3: Drop original columns
ALTER TABLE submissions DROP COLUMN file_data;
ALTER TABLE submissions DROP COLUMN file_name;

-- Step 4: Add columns back in correct order (file_data before file_name)
ALTER TABLE submissions ADD COLUMN file_data BYTEA NOT NULL DEFAULT ''::bytea;
ALTER TABLE submissions ADD COLUMN file_name VARCHAR(512) NOT NULL DEFAULT '';

-- Step 5: Copy data back from temp columns
UPDATE submissions 
SET file_data = temp_file_data, 
    file_name = temp_file_name;

-- Step 6: Drop temp columns
ALTER TABLE submissions DROP COLUMN temp_file_data;
ALTER TABLE submissions DROP COLUMN temp_file_name;

-- Step 7: Remove defaults (they were only needed for adding NOT NULL columns)
ALTER TABLE submissions ALTER COLUMN file_data DROP DEFAULT;
ALTER TABLE submissions ALTER COLUMN file_name DROP DEFAULT;

-- Verify the fix
SELECT column_name, data_type, ordinal_position 
FROM information_schema.columns 
WHERE table_name = 'submissions' 
ORDER BY ordinal_position;
