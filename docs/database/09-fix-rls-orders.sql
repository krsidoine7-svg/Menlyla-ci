-- 09-fix-rls-orders.sql
-- FIX: Missing RLS policies for order_items and improvements for orders

-- ORDER ITEMS
-- 1. Allow anyone to insert order items (needed for customers to place orders)
CREATE POLICY "Anyone can create order items" ON order_items
  FOR INSERT WITH CHECK (true);

-- 2. Allow restaurant admins to read order items of their orders
CREATE POLICY "Resto Admin view order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND public.has_role_in_restaurant(orders.restaurant_id)
    )
  );

-- 3. Allow customers to read order items of their own orders
CREATE POLICY "Customers read own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND auth.uid() = orders.customer_id
    )
  );

-- ORDERS (Improvements)
-- Ensure admins can update order status (already covered by custom logic usually, but let's be explicit)
-- Note: 'has_role_in_restaurant' checks if the user is the owner of the restaurant.
CREATE POLICY "Resto Admin manage orders" ON orders
  FOR UPDATE USING (public.has_role_in_restaurant(restaurant_id));
