-- Fix NULL active values for existing users
UPDATE users SET active = true WHERE active IS NULL;

-- Alter column to set NOT NULL constraint and default
ALTER TABLE users ALTER COLUMN active SET DEFAULT true;
ALTER TABLE users ALTER COLUMN active SET NOT NULL;
