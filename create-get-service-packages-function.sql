-- 서비스 ID로 패키지를 조회하는 함수 생성
CREATE OR REPLACE FUNCTION get_service_packages_by_id(service_id_param INTEGER)
RETURNS SETOF service_packages
LANGUAGE sql
AS $$
  SELECT * FROM service_packages 
  WHERE service_id = service_id_param
$$;
