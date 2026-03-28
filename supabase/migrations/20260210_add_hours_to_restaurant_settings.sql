-- Add hours jsonb column to restaurant_settings table
ALTER TABLE public.restaurant_settings 
ADD COLUMN IF NOT EXISTS hours jsonb DEFAULT '{"mode": "simple", "schedule": {}, "is_on_break": false}'::jsonb;

-- Comment for documentation
COMMENT ON COLUMN public.restaurant_settings.hours IS 'Stores opening hours configuration including schedule and break status';
