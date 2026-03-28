-- Migration: Add super_admin role and permissions
-- Date: 2026-03-26

-- 1. Add columns to app_admins
ALTER TABLE app_admins ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE app_admins ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{"all": true}';

-- 2. Create the bootstrap function
CREATE OR REPLACE FUNCTION public.handle_first_admin_bootstrap()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if ANY admin exists in app_admins table
    IF (SELECT count(*) FROM public.app_admins) = 0 THEN
        -- Insert the first user as super admin
        INSERT INTO public.app_admins (id, email, is_super_admin)
        VALUES (NEW.id, NEW.email, TRUE);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger on profiles (since profiles are synced with auth.users)
-- We use BEFORE because we want to ensure admin status is ready
DROP TRIGGER IF EXISTS on_profile_created_bootstrap_admin ON public.profiles;
CREATE TRIGGER on_profile_created_bootstrap_admin
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_first_admin_bootstrap();

-- 4. Initial update for existing admins (if any)
UPDATE app_admins 
SET is_super_admin = TRUE 
WHERE created_at = (SELECT MIN(created_at) FROM app_admins);

-- 5. Fix RLS for the middleware to work
DROP POLICY IF EXISTS "Admins can view other admins" ON app_admins;
CREATE POLICY "Admins can view admins" 
    ON app_admins FOR SELECT 
    USING (
        auth.uid() = id -- Users can always see their own admin status
        OR 
        EXISTS (SELECT 1 FROM app_admins WHERE id = auth.uid() AND is_super_admin = true) -- Super admins can see all
    );

-- 6. Allow Super Admin to manage others
CREATE POLICY "Super Admins can manage admins"
    ON app_admins FOR ALL
    USING (EXISTS (SELECT 1 FROM app_admins WHERE id = auth.uid() AND is_super_admin = true));
