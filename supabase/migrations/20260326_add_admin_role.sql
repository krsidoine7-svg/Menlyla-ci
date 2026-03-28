-- Migration: Add role to profiles for administration
-- Date: 2026-03-26

-- Step 1: Add role column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Step 2: Add comment for documentation
COMMENT ON COLUMN profiles.role IS 'User role: user, admin. Determines dashboard access.';

-- Step 3: (Self-correction) - If there are users who should be admins, update them here
-- For now, we'll wait for user input or the user can do it via SQL Editor.
-- UPDATE profiles SET role = 'admin' WHERE email = 'YOUR_EMAIL';
