-- 09-add-unique-table-name.sql
-- Force unique table names per restaurant

-- 1. Optional: Clean up duplicates first (manual step usually, but here is a safe way to keep the latest one or error out if duplicates exist)
-- This script assumes no duplicates exist. If they do, delete them first.

ALTER TABLE tables
ADD CONSTRAINT unique_table_name_per_restaurant UNIQUE (restaurant_id, name);
