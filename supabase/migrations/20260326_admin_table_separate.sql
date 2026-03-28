-- Migration: Create separate table for admins
-- Date: 2026-03-26

-- Step 1: Create app_admins table
CREATE TABLE IF NOT EXISTS app_admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Enable RLS on app_admins
ALTER TABLE app_admins ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS Policies
-- Only admins can see who else is an admin
CREATE POLICY "Admins can view other admins" 
    ON app_admins FOR SELECT 
    USING (auth.uid() IN (SELECT id FROM app_admins));

-- Step 4: Add comment for documentation
COMMENT ON TABLE app_admins IS 'System-level administrators table. Separated from user profiles.';

-- Step 5: (Optional) Cleanup role column from profiles if you want a clean separation
-- ALTER TABLE profiles DROP COLUMN IF EXISTS role;
