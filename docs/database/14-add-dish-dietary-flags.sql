-- Migration to add dietary flags to dishes
ALTER TABLE dishes 
ADD COLUMN IF NOT EXISTS is_vegetarian BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_spicy BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_gluten_free BOOLEAN DEFAULT false;
