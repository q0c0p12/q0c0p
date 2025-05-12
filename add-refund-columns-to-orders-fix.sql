-- orders 테이블에 환불 관련 컬럼 추가
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS refunded_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS refunded_amount DECIMAL(10, 2) DEFAULT 0;

-- 기존 데이터 마이그레이션: 부분 환불 상태인 주문에 대해 기본값 설정
UPDATE orders 
SET refunded_quantity = 1, 
    refunded_amount = total_amount * 0.5
WHERE status = 'partial_refund' 
  AND (refunded_quantity IS NULL OR refunded_quantity = 0);
