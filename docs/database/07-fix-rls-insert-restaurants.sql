-- 07-fix-rls-insert-restaurants.sql
-- FIX: Allow authenticated users to create (INSERT) a new restaurant.
-- Constraint: They must set themselves as the owner.

CREATE POLICY "Authenticated users can create restaurants" ON restaurants
FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid());
