-- 서비스 ID로 패키지를 조회하는 함수 생성
CREATE OR REPLACE FUNCTION get_service_packages_by_id(service_id_param INTEGER)
RETURNS SETOF service_packages
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM service_packages
  WHERE service_id = service_id_param
  ORDER BY id ASC;
END;
$$;

-- 함수 권한 설정
GRANT EXECUTE ON FUNCTION get_service_packages_by_id(INTEGER) TO anon, authenticated, service_role;
