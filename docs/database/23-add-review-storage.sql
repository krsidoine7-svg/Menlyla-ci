-- 23-add-review-storage.sql
-- Create storage bucket for review photos

INSERT INTO storage.buckets (id, name, public) 
VALUES ('review-photos', 'review-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for storage
-- 1. Anyone can view review photos
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'review-photos');

-- 2. Anyone can upload review photos
CREATE POLICY "Anyone can upload review photos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'review-photos');
