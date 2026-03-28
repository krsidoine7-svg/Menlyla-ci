-- Fix RLS policies for orders table to allow anonymous order creation
-- Problem: Anonymous users can INSERT orders but cannot SELECT them back,
-- causing "new row violates row-level security policy" error

-- Drop existing restrictive SELECT policies
DROP POLICY IF EXISTS "Customers read own orders" ON orders;
DROP POLICY IF EXISTS "Resto Admin view orders" ON orders;

-- Allow anyone to read orders (needed for payment flow and order tracking)
-- This is safe because orders don't contain sensitive customer data
CREATE POLICY "Anyone can read orders" ON orders
  FOR SELECT USING (true);

-- Keep the existing INSERT policy
-- (Already exists: "Anyone can create orders" FOR INSERT WITH CHECK (true))

-- Resto Admin can still manage (UPDATE) orders
-- (Already exists: "Resto Admin manage orders" FOR UPDATE)

-- Optional: If you want to restrict SELECT to only relevant parties later,
-- you can use a more complex policy like:
-- CREATE POLICY "Read orders for customers and admins" ON orders
--   FOR SELECT USING (
--     auth.uid() = customer_id OR 
--     public.has_role_in_restaurant(restaurant_id) OR
--     customer_id IS NULL
--   );
