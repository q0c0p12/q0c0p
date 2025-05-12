-- 테이블 생성 함수 확인
SELECT EXISTS (
  SELECT 1 FROM pg_proc WHERE proname = 'exec_sql'
);

-- 테이블 존재 여부 확인
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'balance_requests'
);

-- 알림 테이블 존재 여부 확인
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'notifications'
);
