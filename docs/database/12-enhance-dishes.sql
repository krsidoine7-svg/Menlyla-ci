-- 12-enhance-dishes.sql
-- Add fields for likes and promotions

ALTER TABLE dishes 
ADD COLUMN IF NOT EXISTS is_promo BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS old_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- Optional: Create a table for likes if we want to prevent multiple likes from same user/session
-- For now, simple counter is fine for anonymous MVP.
