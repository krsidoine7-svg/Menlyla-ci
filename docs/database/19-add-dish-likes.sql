-- 19-add-dish-likes.sql
-- Add likes count to dishes for social engagement

ALTER TABLE dishes 
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
