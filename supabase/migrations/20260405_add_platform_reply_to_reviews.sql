-- Migration: Add platform reply fields to reviews
-- Date: 2026-04-05

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS platform_reply TEXT,
  ADD COLUMN IF NOT EXISTS platform_replied_at TIMESTAMPTZ;

-- Comment for documentation
COMMENT ON COLUMN reviews.platform_reply IS 'Response directly from the Menlyla platform team (Super Admin)';
COMMENT ON COLUMN reviews.platform_replied_at IS 'Timestamp of the platform response';
