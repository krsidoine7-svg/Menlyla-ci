-- 02-rls-policies.sql
-- Row Level Security Policies
-- PRINCIPLE: STRICT ISOLATION BY RESTAURANT_ID

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifiers_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dish_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------------------
-- HELPER FUNCTIONS FOR POLICIES
--------------------------------------------------------------------------------

-- Check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is admin/staff of a specific restaurant
CREATE OR REPLACE FUNCTION public.has_role_in_restaurant(req_restaurant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Super admin has access to everything
  IF public.is_super_admin() THEN
    RETURN TRUE;
  END IF;

  -- Check logical link via profile (Assuming profiles have restaurant_id)
  -- Note: In our Schema 01, we didn't add restaurant_id to profile yet (omission in simple schema but needed for RLS)
  -- Let's assume we add specific logic or a join table later.
  -- For MVP: Owner of the restaurant table.
  
  RETURN EXISTS (
     SELECT 1 FROM restaurants 
     WHERE id = req_restaurant_id 
     AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

--------------------------------------------------------------------------------
-- 1. PROFILES
--------------------------------------------------------------------------------
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile name/avatar
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Super admins see all
CREATE POLICY "Super admins read all profiles" ON profiles
  FOR SELECT USING (public.is_super_admin());

--------------------------------------------------------------------------------
-- 2. RESTAURANTS
--------------------------------------------------------------------------------
-- Public read (for menu display)
CREATE POLICY "Public read active restaurants" ON restaurants
  FOR SELECT USING (is_active = true);

-- Owner update
CREATE POLICY "Owner can update own restaurant" ON restaurants
  FOR UPDATE USING (owner_id = auth.uid());

-- Super admin all
CREATE POLICY "Super Admin all restaurants" ON restaurants
  FOR ALL USING (public.is_super_admin());

--------------------------------------------------------------------------------
-- 3. MENU (Categories, Dishes, Modifiers)
--------------------------------------------------------------------------------
-- Public read
CREATE POLICY "Public read menu items" ON dishes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM restaurants WHERE id = dishes.restaurant_id AND is_active = true)
  );
  
CREATE POLICY "Public read categories" ON categories
  FOR SELECT USING (true); -- Simplified, usually filtered by restaurant in query

-- Admin write
CREATE POLICY "Resto Admin manage categories" ON categories
  FOR ALL USING (public.has_role_in_restaurant(restaurant_id));

CREATE POLICY "Resto Admin manage dishes" ON dishes
  FOR ALL USING (public.has_role_in_restaurant(restaurant_id));

--------------------------------------------------------------------------------
-- 4. ORDERS
--------------------------------------------------------------------------------
-- Customers can create orders (INSERT)
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Customers can view THEIR orders (via Auth or Session)
-- Note: For anonymous users, this is tricky with RLS. 
-- Usually we rely on Supabase Anon Key and ensure the query returns only what matches a session token stored in table (not implemented in 01-schema).
-- Assuming Authenticated Customers involved:
CREATE POLICY "Customers read own orders" ON orders
  FOR SELECT USING (auth.uid() = customer_id);

-- Resto Admin view all orders for their restaurant
CREATE POLICY "Resto Admin view orders" ON orders
  FOR SELECT USING (public.has_role_in_restaurant(restaurant_id));

--------------------------------------------------------------------------------
-- 5. PAYMENTS
--------------------------------------------------------------------------------
-- Same logic as orders
CREATE POLICY "Resto Admin view payments" ON payments
  FOR SELECT USING (public.has_role_in_restaurant(restaurant_id));
