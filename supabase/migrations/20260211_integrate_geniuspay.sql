-- Migration: Integrate GeniusPay Payment Gateway
-- Replaces LIGOS references with GeniusPay structure
-- Date: 2026-02-11

-- Step 1: Update payment provider enum
-- Note: This renames the existing 'LIGOS' value to 'GENIUSPAY'
ALTER TYPE payment_provider RENAME VALUE 'LIGOS' TO 'GENIUSPAY';

-- Step 2: Add GeniusPay-specific columns to payments table
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS geniuspay_reference TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS geniuspay_payment_id INTEGER,
  ADD COLUMN IF NOT EXISTS checkout_url TEXT,
  ADD COLUMN IF NOT EXISTS fees INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS net_amount INTEGER,
  ADD COLUMN IF NOT EXISTS gateway TEXT, -- 'wave', 'orange_money', 'mtn_money', 'card'
  ADD COLUMN IF NOT EXISTS environment TEXT DEFAULT 'sandbox',
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Step 3: Add index for faster lookups by GeniusPay reference
CREATE INDEX IF NOT EXISTS idx_payments_geniuspay_reference ON payments(geniuspay_reference);

-- Step 4: Add comment for documentation
COMMENT ON COLUMN payments.geniuspay_reference IS 'Unique transaction reference from GeniusPay (e.g., MTX-A1B2C3D4E5)';
COMMENT ON COLUMN payments.gateway IS 'Payment method used: wave, orange_money, mtn_money, or card';
COMMENT ON COLUMN payments.fees IS 'Transaction fees charged by GeniusPay (in minor currency units)';
COMMENT ON COLUMN payments.net_amount IS 'Amount received after fees (in minor currency units)';
