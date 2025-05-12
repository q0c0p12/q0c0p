-- 서비스 패키지 테이블 구조 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'service_packages';

-- 서비스 패키지 데이터 확인
SELECT * FROM service_packages LIMIT 10;

-- 서비스 테이블 구조 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'services';

-- 특정 서비스의 패키지 확인
SELECT s.id as service_id, s.title as service_title, p.id as package_id, p.name as package_name, p.service_id as package_service_id
FROM services s
LEFT JOIN service_packages p ON s.id = p.service_id
WHERE s.slug = 'tes' OR s.id = (CASE WHEN 'tes' ~ '^[0-9]+$' THEN 'tes'::integer ELSE 0 END)
ORDER BY p.id;
