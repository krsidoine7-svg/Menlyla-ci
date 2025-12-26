-- 03-functions-triggers.sql
-- Automation logic

--------------------------------------------------------------------------------
-- 1. AUTO UPDATE UPDATED_AT
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER on_update_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER on_update_restaurants
  BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER on_update_dishes
  BEFORE UPDATE ON dishes
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER on_update_orders
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

--------------------------------------------------------------------------------
-- 2. NEW USER HANDLER (Supabase Auth Hook)
--------------------------------------------------------------------------------
-- This triggers when a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'customer' -- Default role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind to auth.users (Supabase specific)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
