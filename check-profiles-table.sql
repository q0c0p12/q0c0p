-- profiles 테이블이 존재하는지 확인
SELECT EXISTS (
  SELECT 1 FROM pg_tables 
  WHERE schemaname = 'public' 
  AND tablename = 'profiles'
);

-- profiles 테이블의 구조 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles';
