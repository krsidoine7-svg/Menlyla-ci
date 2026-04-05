-- Migration: Add global payment gateway toggles to system_settings
-- Date: 2026-04-05

ALTER TABLE system_settings
  ADD COLUMN IF NOT EXISTS is_geniuspay_enabled BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS is_lygos_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_paystack_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_manual_payment_enabled BOOLEAN DEFAULT TRUE;

-- Comment for documentation
COMMENT ON COLUMN system_settings.is_geniuspay_enabled IS 'Global toggle for GeniusPay aggregator availability';
COMMENT ON COLUMN system_settings.is_lygos_enabled IS 'Global toggle for LYGOS aggregator availability';
COMMENT ON COLUMN system_settings.is_paystack_enabled IS 'Global toggle for Paystack aggregator availability';
COMMENT ON COLUMN system_settings.is_manual_payment_enabled IS 'Global toggle for Manual/Delivery payment availability';
