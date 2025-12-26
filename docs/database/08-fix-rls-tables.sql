-- 08-fix-rls-tables.sql
-- FIX: Add missing RLS policies for Tables and QR Codes

-- TABLES
-- Restaurant owners/admins can manage tables
CREATE POLICY "Resto Admin manage tables" ON tables
  FOR ALL USING (public.has_role_in_restaurant(restaurant_id));

-- QR CODES
-- Restaurant owners/admins can manage QR codes
CREATE POLICY "Resto Admin manage qr_codes" ON qr_codes
  FOR ALL USING (public.has_role_in_restaurant(restaurant_id));

-- Public read for QR Codes (required for scanning/redirecting)
CREATE POLICY "Public read qr_codes" ON qr_codes
  FOR SELECT USING (true);
