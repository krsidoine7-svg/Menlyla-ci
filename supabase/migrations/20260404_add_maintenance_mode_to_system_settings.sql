-- Add is_maintenance_mode to system_settings if it doesn't exist
ALTER TABLE public.system_settings 
ADD COLUMN IF NOT EXISTS is_maintenance_mode BOOLEAN DEFAULT FALSE;
