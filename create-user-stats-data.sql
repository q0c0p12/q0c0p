-- 사용자 통계 테이블이 없는 경우 생성
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  total_orders INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기존 사용자 통계 데이터 확인
SELECT * FROM user_stats;

-- 테스트 사용자 ID 가져오기
SELECT id FROM auth.users LIMIT 5;

-- 테스트 사용자 통계 데이터 삽입 (실제 사용자 ID로 대체해야 함)
-- 여기서는 예시로 사용자 ID를 사용합니다. 실제 환경에서는 실제 사용자 ID로 대체해야 합니다.
INSERT INTO user_stats (id, user_id, balance, total_spent, total_orders)
VALUES 
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 250000, 750000, 25),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 180000, 420000, 18),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 320000, 980000, 32)
ON CONFLICT (id) DO NOTHING;

-- 알림 테이블 생성
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

-- 테스트 알림 데이터 삽입
INSERT INTO notifications (user_id, title, description)
VALUES 
  ('00000000-0000-0000-0000-000000000000', '주문 완료', '인스타그램 팔로워 주문이 완료되었습니다.', NOW()),
  ('00000000-0000-0000-0000-000000000000', '잔액 충전', '50,000원이 계정에 충전되었습니다.', NOW() - INTERVAL '1 HOUR'),
  ('00000000-0000-0000-0000-000000000000', '시스템 알림', '시스템 점검이 예정되어 있습니다.', NOW() - INTERVAL '3 HOURS'),
  ('11111111-1111-1111-1111-111111111111', '주문 완료', '유튜브 구독자 주문이 완료되었습니다.', NOW()),
  ('11111111-1111-1111-1111-111111111111', '잔액 충전', '100,000원이 계정에 충전되었습니다.', NOW() - INTERVAL '2 HOURS');

-- 이벤트 테이블 생성
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 테스트 이벤트 데이터 삽입
INSERT INTO events (title, description, date)
VALUES 
  ('여름 프로모션', '모든 서비스 10% 할인', '2025-06-01'),
  ('신규 서비스 출시', '트위터 팔로워 서비스 출시', '2025-05-15'),
  ('블랙 프라이데이 세일', '모든 서비스 20% 할인', '2025-11-25');

-- 테스트 주문 데이터에 플랫폼 정보 추가
ALTER TABLE test_orders ADD COLUMN IF NOT EXISTS platform TEXT;

-- 기존 주문 데이터에 플랫폼 정보 업데이트
UPDATE test_orders 
SET platform = CASE 
  WHEN service LIKE '%인스타그램%' THEN '인스타그램'
  WHEN service LIKE '%유튜브%' THEN '유튜브'
  WHEN service LIKE '%페이스북%' THEN '페이스북'
  WHEN service LIKE '%틱톡%' THEN '틱톡'
  ELSE '기타'
END
WHERE platform IS NULL;

-- 필요한 RPC 함수 생성
CREATE OR REPLACE FUNCTION get_daily_order_count(user_id_param UUID, days_param INTEGER)
RETURNS TABLE(date TIMESTAMP WITH TIME ZONE, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE_TRUNC('day', o.date) AS date,
    COUNT(*) AS count
  FROM 
    test_orders o
  WHERE 
    o.user_id = user_id_param
    AND o.date >= NOW() - (days_param || ' days')::INTERVAL
  GROUP BY 
    DATE_TRUNC('day', o.date)
  ORDER BY 
    date;
END;
$$ LANGUAGE plpgsql;

-- 인기 서비스 조회 함수
CREATE OR REPLACE FUNCTION get_popular_services_by_user(user_id_param UUID)
RETURNS TABLE(service TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.service,
    COUNT(*) AS count
  FROM 
    test_orders o
  WHERE 
    o.user_id = user_id_param
  GROUP BY 
    o.service
  ORDER BY 
    count DESC;
END;
$$ LANGUAGE plpgsql;

-- 카테고리 통계 조회 함수
CREATE OR REPLACE FUNCTION get_category_stats_by_user(user_id_param UUID)
RETURNS TABLE(platform TEXT, percentage INTEGER) AS $$
DECLARE
  total_count BIGINT;
BEGIN
  -- 총 주문 수 계산
  SELECT COUNT(*) INTO total_count FROM test_orders WHERE user_id = user_id_param;
  
  -- 플랫폼별 비율 계산
  RETURN QUERY
  SELECT 
    o.platform,
    CASE 
      WHEN total_count > 0 THEN ROUND((COUNT(*) * 100.0 / total_count)::NUMERIC)::INTEGER
      ELSE 0
    END AS percentage
  FROM 
    test_orders o
  WHERE 
    o.user_id = user_id_param
  GROUP BY 
    o.platform
  ORDER BY 
    percentage DESC;
END;
$$ LANGUAGE plpgsql;
