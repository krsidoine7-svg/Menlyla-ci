-- Migration to add more details to restaurants table
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Ensure currency column exists (it should, but just in case)
-- ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'FCFA';
