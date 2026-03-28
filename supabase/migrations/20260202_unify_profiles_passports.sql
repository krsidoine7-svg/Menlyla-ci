-- Migration: Unify profiles and passports tables
-- This migration merges the passport functionality into the profiles table

-- Step 1: Add passport fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS profile_image TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS custom_links JSONB DEFAULT '[]'::jsonb;

-- Step 2: Add constraint for username format (same as passports)
ALTER TABLE profiles
ADD CONSTRAINT username_format CHECK (username IS NULL OR username ~ '^[a-z0-9-]+$');

-- Step 3: Create index on username for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Step 4: Migrate data from passports to profiles (if passports table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'passports') THEN
        -- Copy data from passports to profiles
        UPDATE profiles p
        SET 
            username = ps.username,
            full_name = COALESCE(p.full_name, ps.full_name),
            bio = ps.bio,
            phone = ps.phone,
            email = COALESCE(p.email, ps.email),
            profile_image = COALESCE(p.profile_image, ps.profile_image),
            social_links = ps.social_links,
            custom_links = ps.custom_links,
            updated_at = NOW()
        FROM passports ps
        WHERE p.id = ps.user_id;
        
        -- Drop the passports table (data already migrated)
        DROP TABLE IF EXISTS passports CASCADE;
    END IF;
END $$;

-- Step 5: Add comment to document the unified approach
COMMENT ON TABLE profiles IS 'Unified user profiles including personal info, passport/business card data, and social links';
COMMENT ON COLUMN profiles.username IS 'Unique username for public passport URL (e.g., /passport/johndoe)';
COMMENT ON COLUMN profiles.bio IS 'User biography for digital business card';
COMMENT ON COLUMN profiles.social_links IS 'JSON object with social media links (whatsapp, instagram, facebook, linkedin)';
COMMENT ON COLUMN profiles.custom_links IS 'JSON array of custom links for business card';

-- Step 6: Update RLS policies for public passport access
DROP POLICY IF EXISTS "Public can view profiles by username" ON profiles;

CREATE POLICY "Public can view profiles by username"
    ON profiles
    FOR SELECT
    USING (username IS NOT NULL);

-- Step 7: Ensure restaurants table has owner_id properly linked
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON restaurants(owner_id);

COMMENT ON COLUMN restaurants.owner_id IS 'Link to the restaurant owner profile (contains passport info)';
