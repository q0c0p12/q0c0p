-- orders 테이블에 필요한 컬럼 추가
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS refunded_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_paid DECIMAL(10, 2);

-- 기존 데이터 마이그레이션: total_price가 NULL인 경우 total_amount 값으로 설정
UPDATE orders 
SET total_price = total_amount
WHERE total_price IS NULL;

-- 기존 데이터 마이그레이션: total_paid가 NULL인 경우 total_price 값으로 설정
UPDATE orders 
SET total_paid = total_price
WHERE total_paid IS NULL;

-- 주문 항목에서 quantity 정보 가져와서 orders 테이블 업데이트
UPDATE orders o
SET quantity = (
  SELECT COALESCE(SUM(quantity), 1)
  FROM order_items
  WHERE order_id = o.id
)
WHERE quantity IS NULL OR quantity = 0;
