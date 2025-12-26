-- Migration to add currency to restaurants table
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'FCFA';
