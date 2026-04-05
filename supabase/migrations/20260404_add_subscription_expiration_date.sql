-- Migration: Add subscription_expires_at to restaurants
-- Date: 2026-04-04

ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- Comment for documentation
COMMENT ON COLUMN restaurants.subscription_expires_at IS 'Expiration date of the current subscription plan';
