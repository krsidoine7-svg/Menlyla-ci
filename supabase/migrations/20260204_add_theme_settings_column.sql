-- Add theme_settings jsonb column to restaurant_settings table
ALTER TABLE public.restaurant_settings 
ADD COLUMN IF NOT EXISTS theme_settings jsonb DEFAULT '{}'::jsonb;

-- Comment for documentation
COMMENT ON COLUMN public.restaurant_settings.theme_settings IS 'Stores visual theme configuration like secondary_color, use_gradient, etc.';
