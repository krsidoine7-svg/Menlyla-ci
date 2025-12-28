-- 20-add-review-reply.sql
-- Add owner reply functionality to reviews

ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS owner_reply TEXT,
ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP WITH TIME ZONE;
