-- 21-add-review-verification.sql
-- Add order verification to reviews

ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Index for verification lookups
CREATE INDEX IF NOT EXISTS idx_reviews_order ON reviews(order_id);
