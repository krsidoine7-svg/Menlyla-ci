-- Migration: Add whatsapp column to restaurants table
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS whatsapp TEXT;

COMMENT ON COLUMN restaurants.whatsapp IS 'Direct WhatsApp link for the restaurant (e.g., wa.me/...)';
