-- 알림 테이블 생성
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

-- 이벤트 테이블 생성
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 샘플 알림 데이터 추가
INSERT INTO notifications (user_id, title, description)
VALUES 
  ('00000000-0000-0000-0000-000000000000', '주문 완료', '인스타그램 팔로워 주문이 완료되었습니다.'),
  ('00000000-0000-0000-0000-000000000000', '잔액 충전', '50,000원이 계정에 충전되었습니다.'),
  ('00000000-0000-0000-0000-000000000000', '시스템 알림', '시스템 점검이 예정되어 있습니다.');

-- 샘플 이벤트 데이터 추가
INSERT INTO events (title, description, date)
VALUES 
  ('여름 프로모션', '모든 서비스 10% 할인', '2025-06-01'),
  ('신규 서비스 출시', '트위터 팔로워 서비스 출시', '2025-05-15');
