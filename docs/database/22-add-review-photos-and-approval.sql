-- 22-add-review-photos-and-approval.sql
-- Add support for review photos and manual approval system

ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Update existing reviews to approved to avoid hiding them
UPDATE reviews SET status = 'approved' WHERE status = 'pending';

-- Add index for status filtering
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
