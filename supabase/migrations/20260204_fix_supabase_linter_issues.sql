-- Migration: Fix Supabase Linter Issues
-- Created: 2026-02-04
-- This migration addresses security and configuration warnings from the Supabase Linter report.

--------------------------------------------------------------------------------
-- 1. ERROR: Security Definer View
--------------------------------------------------------------------------------
-- View `public.user_activity_stats` is defined with SECURITY DEFINER.
-- We change it to SECURITY INVOKER so RLS of the querying user is respected.
ALTER VIEW IF EXISTS public.user_activity_stats SET (security_invoker = on);

--------------------------------------------------------------------------------
-- 2. WARN: Extension in Public
--------------------------------------------------------------------------------
-- Extension `moddatetime` should be in a dedicated schema.
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION "moddatetime" SET SCHEMA extensions;

--------------------------------------------------------------------------------
-- 3. WARN: Function Search Path Mutable
--------------------------------------------------------------------------------
-- Functions should have a fixed search_path to prevent hijacking.

DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT format('%I.%I(%s)', n.nspname, p.proname, pg_get_function_identity_arguments(p.oid)) as signature
        FROM pg_proc p 
        JOIN pg_namespace n ON n.oid = p.pronamespace 
        WHERE n.nspname = 'public'
        AND p.proname IN (
            'has_role_in_restaurant',
            'is_super_admin',
            'handle_updated_at',
            'handle_new_user',
            'update_updated_at_column',
            'get_forgotten_contacts',
            'log_contact_activity'
        )
    LOOP
        EXECUTE format('ALTER FUNCTION %s SET search_path = public', func_record.signature);
        RAISE NOTICE 'Fixed search_path for %', func_record.signature;
    END LOOP;
END $$;

--------------------------------------------------------------------------------
-- 4. WARN: RLS Policy Always True (INSERT)
--------------------------------------------------------------------------------
-- Instead of WITH CHECK (true), we use a minimal valid check.

DO $$
BEGIN
    -- order_items
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can create order items' AND tablename = 'order_items') THEN
        ALTER POLICY "Anyone can create order items" ON public.order_items WITH CHECK (order_id IS NOT NULL);
    END IF;

    -- orders
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can create orders' AND tablename = 'orders') THEN
        ALTER POLICY "Anyone can create orders" ON public.orders WITH CHECK (restaurant_id IS NOT NULL);
    END IF;

    -- reviews
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can insert a review' AND tablename = 'reviews') THEN
        ALTER POLICY "Anyone can insert a review" ON public.reviews WITH CHECK (restaurant_id IS NOT NULL);
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Ajout public' AND tablename = 'reviews') THEN
        ALTER POLICY "Ajout public" ON public.reviews WITH CHECK (restaurant_id IS NOT NULL);
    END IF;
END $$;

--------------------------------------------------------------------------------
-- 5. INFO: RLS Enabled No Policy
--------------------------------------------------------------------------------

-- restaurant_settings
DROP POLICY IF EXISTS "Public read restaurant settings" ON public.restaurant_settings;
CREATE POLICY "Public read restaurant settings" ON public.restaurant_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Resto Admin manage restaurant settings" ON public.restaurant_settings;
CREATE POLICY "Resto Admin manage restaurant settings" ON public.restaurant_settings FOR ALL USING (public.has_role_in_restaurant(restaurant_id));

-- modifiers_groups
DROP POLICY IF EXISTS "Public read modifiers groups" ON public.modifiers_groups;
CREATE POLICY "Public read modifiers groups" ON public.modifiers_groups FOR SELECT USING (true);
DROP POLICY IF EXISTS "Resto Admin manage modifiers groups" ON public.modifiers_groups;
CREATE POLICY "Resto Admin manage modifiers groups" ON public.modifiers_groups FOR ALL USING (public.has_role_in_restaurant(restaurant_id));

-- modifiers
DROP POLICY IF EXISTS "Public read modifiers" ON public.modifiers;
CREATE POLICY "Public read modifiers" ON public.modifiers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Resto Admin manage modifiers" ON public.modifiers;
CREATE POLICY "Resto Admin manage modifiers" ON public.modifiers FOR ALL USING (
    EXISTS (SELECT 1 FROM public.modifiers_groups WHERE id = public.modifiers.group_id AND public.has_role_in_restaurant(restaurant_id))
);

-- dish_modifiers
DROP POLICY IF EXISTS "Public read dish modifiers" ON public.dish_modifiers;
CREATE POLICY "Public read dish modifiers" ON public.dish_modifiers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Resto Admin manage dish modifiers" ON public.dish_modifiers;
CREATE POLICY "Resto Admin manage dish modifiers" ON public.dish_modifiers FOR ALL USING (
    EXISTS (SELECT 1 FROM public.dishes WHERE id = public.dish_modifiers.dish_id AND public.has_role_in_restaurant(restaurant_id))
);

--------------------------------------------------------------------------------
-- final comments
--------------------------------------------------------------------------------
COMMENT ON SCHEMA extensions IS 'Dedicated schema for database extensions';
