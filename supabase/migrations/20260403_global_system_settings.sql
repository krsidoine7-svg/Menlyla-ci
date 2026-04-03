-- Migration: Global System Settings
-- Date: 2026-04-03
-- Purpose: Global platform-wide toggles for payments and SaaS.

-- Step 1: Create system_settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
    id INTEGER PRIMARY KEY DEFAULT 1, -- Singleton row
    is_saas_payments_enabled BOOLEAN DEFAULT TRUE,
    is_order_payments_enabled BOOLEAN DEFAULT TRUE,
    platform_commission_percent DECIMAL DEFAULT 2.5,
    monthly_pro_price_xof INTEGER DEFAULT 25000,
    is_maintenance_mode BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Ensure we have the singleton row
INSERT INTO public.system_settings (id) 
VALUES (1) 
ON CONFLICT (id) DO NOTHING;

-- Step 3: Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Step 4: RLS Policies
-- Everyone can read (public settings)
CREATE POLICY "Everyone can read system settings" 
    ON public.system_settings FOR SELECT 
    USING (true);

-- Only super admins can update
CREATE POLICY "Super admins can update system settings" 
    ON public.system_settings FOR UPDATE
    USING (auth.uid() IN (SELECT id FROM public.app_admins WHERE is_super_admin = true));

-- Step 5: Function to update timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

COMMENT ON TABLE public.system_settings IS 'Global platform-wide configuration settings.';
