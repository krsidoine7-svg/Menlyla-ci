-- Migration to add upsell/recommendation links
ALTER TABLE dishes 
ADD COLUMN IF NOT EXISTS upsell_ids UUID[] DEFAULT '{}';
