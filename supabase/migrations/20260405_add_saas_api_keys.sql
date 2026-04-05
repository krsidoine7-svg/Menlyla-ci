-- Migration: Add SaaS specific API keys to system_settings
-- Date: 2026-04-05

ALTER TABLE system_settings
  ADD COLUMN IF NOT EXISTS saas_geniuspay_key TEXT,
  ADD COLUMN IF NOT EXISTS saas_geniuspay_secret TEXT,
  ADD COLUMN IF NOT EXISTS saas_geniuspay_webhook_secret TEXT;

-- Comment for documentation
COMMENT ON COLUMN system_settings.saas_geniuspay_key IS 'API Key for the platform SaaS payments (subscriptions)';
COMMENT ON COLUMN system_settings.saas_geniuspay_secret IS 'API Secret for the platform SaaS payments (subscriptions)';
COMMENT ON COLUMN system_settings.saas_geniuspay_webhook_secret IS 'Webhook Secret for the platform SaaS payments (subscriptions)';
