-- 서비스 테이블 구조 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'services';

-- 서비스 패키지 테이블 구조 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'service_packages';

-- 서비스 데이터 확인
SELECT id, title, slug FROM services LIMIT 10;

-- 서비스 패키지 데이터 확인
SELECT id, service_id, name FROM service_packages LIMIT 10;

-- 서비스 ID 5에 해당하는 패키지 확인
SELECT * FROM service_packages WHERE service_id = 5;

-- 서비스 ID 4에 해당하는 패키지 확인
SELECT * FROM service_packages WHERE service_id = 4;
