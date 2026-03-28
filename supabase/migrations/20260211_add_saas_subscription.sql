-- Migration: Add SaaS Subscription fields to restaurants
-- Date: 2026-02-11

-- Step 1: Ensure GENIUSPAY is in payment_provider enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'payment_provider' AND e.enumlabel = 'GENIUSPAY') THEN
        ALTER TYPE payment_provider ADD VALUE 'GENIUSPAY';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Step 2: Add subscription fields to restaurants
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'solo',
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';

-- Step 3: Update existing restaurants to have 'solo' and 'active'
UPDATE restaurants SET plan = 'solo', subscription_status = 'active' WHERE plan IS NULL;

-- Step 4: Add comment for documentation
COMMENT ON COLUMN restaurants.plan IS 'Subscription plan: solo, pro';
COMMENT ON COLUMN restaurants.subscription_status IS 'Active subscription status: active, pending, expired, cancelled';

-- Step 5: Ensure payments table has required columns
-- (The GeniusPay migration already added generic-ish columns, but let's add a generic reference column if not there)
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS provider_tx_id TEXT;
