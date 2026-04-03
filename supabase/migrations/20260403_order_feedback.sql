-- Add rating and feedback columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS feedback TEXT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_orders_rating ON orders(rating);
