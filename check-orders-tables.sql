-- 주문 관련 테이블 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%order%';

-- orders 테이블 구조 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders';

-- 실제 주문 데이터 샘플 확인
SELECT * FROM orders LIMIT 5;
