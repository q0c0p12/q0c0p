-- profiles 테이블이 없는 경우 생성
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  balance INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  total_orders INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기존 profiles 테이블 확인
SELECT * FROM profiles;

-- 테스트 사용자 ID 가져오기
SELECT id FROM auth.users LIMIT 5;

-- 테스트 프로필 데이터 삽입 (실제 사용자 ID로 대체해야 함)
INSERT INTO profiles (user_id, username, full_name, avatar_url, balance, total_spent, total_orders)
SELECT 
  id, 
  CONCAT('user_', SUBSTRING(id::text, 1, 8)), 
  CONCAT('사용자 ', SUBSTRING(id::text, 1, 4)),
  NULL,
  FLOOR(RANDOM() * 500000) + 50000,  -- 50,000 ~ 550,000 사이의 잔액
  FLOOR(RANDOM() * 1000000) + 100000, -- 100,000 ~ 1,100,000 사이의 총 지출
  FLOOR(RANDOM() * 50) + 5  -- 5 ~ 55 사이의 총 주문 수
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE profiles.user_id = auth.users.id
)
LIMIT 10;

-- 데이터 확인
SELECT * FROM profiles;
