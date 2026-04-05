-- Migration: Add Lead Magnet Webhook URL to system_settings
-- Date: 2026-04-05

ALTER TABLE system_settings
  ADD COLUMN IF NOT EXISTS lead_magnet_webhook_url TEXT;

-- Comment for documentation
COMMENT ON COLUMN system_settings.lead_magnet_webhook_url IS 'Webhook URL for Lead Magnet submissions (usually Make.com or n8n)';
