-- Add dining type and payment status to orders
ALTER TABLE IF EXISTS orders 
ADD COLUMN IF NOT EXISTS dining_type TEXT DEFAULT 'dine_in' CHECK (dining_type IN ('dine_in', 'take_away')),
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partially_paid'));

-- Comment for clarity
COMMENT ON COLUMN orders.dining_type IS 'Mode de consommation: dine_in (sur place) or take_away (à emporter)';
COMMENT ON COLUMN orders.payment_status IS 'Statut du paiement de la commande';
