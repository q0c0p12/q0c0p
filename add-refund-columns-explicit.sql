-- orders 테이블에 필요한 컬럼 추가
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS refunded_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_paid DECIMAL(10, 2);

-- 기존 데이터 마이그레이션: total_paid가 NULL인 경우 total_amount 값으로 설정
UPDATE orders 
SET total_paid = total_amount
WHERE total_paid IS NULL;
