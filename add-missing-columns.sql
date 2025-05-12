-- orders 테이블에 누락된 컬럼 추가
ALTER TABLE orders ADD COLUMN IF NOT EXISTS instructions TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS link TEXT;
