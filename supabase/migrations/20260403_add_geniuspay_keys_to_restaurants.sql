-- Migration: Add GeniusPay keys to restaurants for direct payments
-- Date: 2026-04-03

ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS geniuspay_api_key TEXT,
  ADD COLUMN IF NOT EXISTS geniuspay_api_secret TEXT,
  ADD COLUMN IF NOT EXISTS geniuspay_webhook_secret TEXT;

COMMENT ON COLUMN restaurants.geniuspay_api_key IS 'Clé API publique du restaurant sur GeniusPay pour les paiements directs';
COMMENT ON COLUMN restaurants.geniuspay_api_secret IS 'Clé API secrète du restaurant sur GeniusPay pour les paiements directs';
COMMENT ON COLUMN restaurants.geniuspay_webhook_secret IS 'Secret de webhook du restaurant sur GeniusPay pour les paiements directs';
