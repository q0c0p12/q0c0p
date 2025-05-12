-- orders 테이블의 컬럼 구조 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders';
