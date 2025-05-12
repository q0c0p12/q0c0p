-- 테스트 사용자 생성
INSERT INTO profiles (id, full_name, email, points, created_at, updated_at)
VALUES 
  (gen_random_uuid(), '테스트 사용자 1', 'test1@example.com', 5000, NOW(), NOW()),
  (gen_random_uuid(), '테스트 사용자 2', 'test2@example.com', 3000, NOW(), NOW()),
  (gen_random_uuid(), '테스트 사용자 3', 'test3@example.com', 1000, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- 생성된 사용자 확인
SELECT id, full_name, email, points FROM profiles ORDER BY created_at DESC LIMIT 10;
