-- Add refunded_amount column to orders table if it doesn't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS refunded_amount DECIMAL(10, 2) DEFAULT 0;

-- Update existing partial refund orders to calculate refunded_amount
-- based on refunded_quantity and price if available
UPDATE orders
SET refunded_amount = (refunded_quantity * (
  SELECT COALESCE(price, total_amount / NULLIF(quantity, 0))
  FROM order_items
  WHERE order_id = orders.id
  LIMIT 1
))
WHERE status = 'partial_refund' 
  AND refunded_quantity > 0 
  AND refunded_amount IS NULL;
