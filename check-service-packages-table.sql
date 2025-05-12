-- 서비스 패키지 테이블 구조 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'service_packages';

-- 서비스 패키지 데이터 확인
SELECT * FROM service_packages;
