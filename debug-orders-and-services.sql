-- 주문 항목과 서비스 정보 확인
SELECT 
  oi.id as order_item_id,
  oi.order_id,
  oi.service_id,
  oi.service_title,
  oi.package_id,
  oi.package_name,
  oi.quantity,
  oi.price,
  s.id as service_table_id,
  s.title as service_table_title
FROM 
  order_items oi
LEFT JOIN 
  services s ON oi.service_id = s.id
LIMIT 10;

-- 서비스 테이블 구조 확인
SELECT 
  column_name, 
  data_type 
FROM 
  information_schema.columns 
WHERE 
  table_name = 'services';

-- 패키지 테이블 구조 확인
SELECT 
  column_name, 
  data_type 
FROM 
  information_schema.columns 
WHERE 
  table_name = 'service_packages';
