-- profiles 테이블에 total_spent와 total_orders 필드 추가 (없는 경우)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_spent INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0;

-- 현재 profiles 테이블 구조 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- 사용자별 총 주문 금액과 주문 건수 계산
WITH user_order_stats AS (
  SELECT 
    user_id,
    SUM(amount) as total_spent,
    COUNT(*) as total_orders
  FROM test_orders
  GROUP BY user_id
)

-- profiles 테이블 업데이트
UPDATE profiles
SET 
  total_spent = uos.total_spent,
  total_orders = uos.total_orders
FROM user_order_stats uos
WHERE profiles.id = uos.user_id;

-- 업데이트된 데이터 확인
SELECT id, points, total_spent, total_orders FROM profiles;

-- 주문 데이터가 없는 사용자를 위한 샘플 데이터 생성
UPDATE profiles
SET 
  total_spent = FLOOR(RANDOM() * 1000000) + 100000,
  total_orders = FLOOR(RANDOM() * 50) + 5
WHERE total_spent = 0 OR total_orders = 0;

-- 최종 데이터 확인
SELECT id, points, total_spent, total_orders FROM profiles;
