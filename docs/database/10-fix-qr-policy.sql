-- 10-fix-qr-policy.sql
-- Ensure owners can definitely insert QR codes without relying on complex functions

DROP POLICY IF EXISTS "Resto Admin manage qr_codes" ON qr_codes;

CREATE POLICY "Resto Admin all qr_codes" ON qr_codes
FOR ALL
USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid()) OR 
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);
