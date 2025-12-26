-- 04-seed-data.sql
-- Fake data for development testing

-- Note: We cannot seed auth.users directly via SQL in Supabase easily without being superuser.
-- These queries assume corresponding users exist or are ignored for now.

-- 1. Create a Demo Restaurant
INSERT INTO restaurants (id, slug, name, description, currency)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'le-maquis-2-0', 'Le Maquis 2.0', 'Le meilleur braisé d Abidjan', 'XOF');

-- 2. Restaurant Settings
INSERT INTO restaurant_settings (restaurant_id, primary_color)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '#F97316'); -- Orange

-- 3. Categories
INSERT INTO categories (id, restaurant_id, name, rank)
VALUES
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Entrées', 1),
  ('b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Plats de Résistance', 2),
  ('b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Boissons', 3);

-- 4. Dishes
INSERT INTO dishes (restaurant_id, category_id, name, price, description)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Alloco', 1500, 'Bananes plantains frites'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Poulet Braisé', 8000, 'Poulet entier avec accompagnement au choix'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Bock Solibra 66cl', 1000, 'La bière ivoirienne');

-- 5. Tables
INSERT INTO tables (restaurant_id, name, capacity)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Table 1', 4),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Table 2', 2),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Terrasse VIP', 10);
