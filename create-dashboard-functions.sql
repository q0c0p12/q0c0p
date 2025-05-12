-- 사용자별 일일 주문 수를 가져오는 함수
CREATE OR REPLACE FUNCTION get_daily_order_count(user_id_param UUID, days_param INTEGER)
RETURNS TABLE(date DATE, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(o.date) as date,
    COUNT(*) as count
  FROM 
    test_orders o
  WHERE 
    o.user_id = user_id_param
    AND o.date >= CURRENT_DATE - (days_param || ' days')::INTERVAL
  GROUP BY 
    DATE(o.date)
  ORDER BY 
    date ASC;
END;
$$ LANGUAGE plpgsql;

-- 사용자별 인기 서비스를 가져오는 함수
CREATE OR REPLACE FUNCTION get_popular_services_by_user(user_id_param UUID)
RETURNS TABLE(service TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.service,
    COUNT(*) as count
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

-- 사용자별 카테고리 통계를 가져오는 함수
CREATE OR REPLACE FUNCTION get_category_stats_by_user(user_id_param UUID)
RETURNS TABLE(platform TEXT, percentage INTEGER) AS $$
DECLARE
  total_count BIGINT;
BEGIN
  -- 총 주문 수 계산
  SELECT COUNT(*) INTO total_count FROM test_orders WHERE user_id = user_id_param;
  
  -- 각 플랫폼별 비율 계산
  RETURN QUERY
  SELECT 
    o.platform,
    CASE 
      WHEN total_count > 0 THEN ROUND((COUNT(*) * 100.0 / total_count)::numeric)::INTEGER
      ELSE 0
    END as percentage
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

-- 알림 테이블 생성 (없는 경우)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

-- 이벤트 테이블 생성 (없는 경우)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 샘플 이벤트 데이터 추가
INSERT INTO events (title, description, date)
VALUES 
  ('여름 프로모션', '모든 서비스 10% 할인', '2025-06-01'),
  ('신규 서비스 출시', '트위터 팔로워 서비스 출시', '2025-05-15')
ON CONFLICT DO NOTHING;
