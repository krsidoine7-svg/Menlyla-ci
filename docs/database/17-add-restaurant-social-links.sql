-- Migration to add social links to restaurants table
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';
