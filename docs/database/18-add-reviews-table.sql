-- 18-add-reviews-table.sql
-- Table for customer reviews

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    dish_id UUID REFERENCES dishes(id) ON DELETE CASCADE, -- Optional: review can be for a specific dish
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    customer_name TEXT DEFAULT 'Client Anonyme',
    
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX idx_reviews_dish ON reviews(dish_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Everyone can read published reviews
CREATE POLICY "Anyone can view published reviews" ON reviews
    FOR SELECT USING (is_published = true);

-- 2. Anyone can insert a review (anonymously)
CREATE POLICY "Anyone can insert a review" ON reviews
    FOR INSERT WITH CHECK (true);

-- 3. Restaurant owner can manage all reviews for their restaurant
CREATE POLICY "Owners can manage their restaurant reviews" ON reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM restaurants 
            WHERE restaurants.id = reviews.restaurant_id 
            AND restaurants.owner_id = auth.uid()
        )
    );
