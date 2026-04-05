-- Migration: Add missing CRM fields and Feature Requests table
-- Date: 2026-04-05

-- 1. Update restaurants for subscription tracking
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS total_revenue_cache NUMERIC(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;

-- 2. Create Feature Requests table for feedback
CREATE TABLE IF NOT EXISTS platform_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- pending, reviewing, planned, completed, rejected
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Comments
COMMENT ON COLUMN restaurants.subscription_started_at IS 'Date when the current plan was activated';
COMMENT ON COLUMN restaurants.total_revenue_cache IS 'Cached total revenue for admin dashboard performance';
COMMENT ON TABLE platform_suggestions IS 'Suggestions and feature requests from restaurant owners';
