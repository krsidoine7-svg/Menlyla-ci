-- Migration: Create specialized Admin CRM view
-- Date: 2026-04-05

CREATE OR REPLACE VIEW admin_restaurants_crm AS
SELECT 
    r.*,
    p.full_name as owner_name,
    p.email as owner_email,
    (SELECT count(*) FROM dishes d WHERE d.restaurant_id = r.id) as dish_count,
    (SELECT count(*) FROM categories c WHERE c.restaurant_id = r.id) as category_count,
    (SELECT count(*) FROM tables t WHERE t.restaurant_id = r.id) as qr_code_count,
    (SELECT COALESCE(SUM(amount), 0) FROM payments pay WHERE pay.restaurant_id = r.id AND pay.status = 'success') as total_revenue,
    (SELECT count(*) FROM orders o WHERE o.restaurant_id = r.id AND o.status != 'cancelled') as total_orders
FROM 
    restaurants r
LEFT JOIN 
    profiles p ON r.owner_id = p.id;

-- Security: Ensure only super admins can read this view
-- (Requires RLS or specific database permissions if not using the Service Role)
COMMENT ON VIEW admin_restaurants_crm IS 'Aggregated view based on restaurant stats for the Super Admin CRM';
