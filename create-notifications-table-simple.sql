-- 알림 테이블 생성
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system',
  user_id UUID,
  created_by UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- 테스트 데이터 삽입
INSERT INTO notifications (title, content, type)
VALUES 
  ('시스템 점검 안내', '시스템 점검이 예정되어 있습니다. 자세한 내용은 공지사항을 확인해주세요.', 'system'),
  ('결제 완료', '주문 #12345에 대한 결제가 완료되었습니다.', 'payment'),
  ('주문 상태 변경', '주문 #12345의 상태가 처리 중으로 변경되었습니다.', 'order');
