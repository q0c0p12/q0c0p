-- 알림 테이블 생성
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'system',
  is_read BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 테스트 데이터 추가
INSERT INTO notifications (user_id, title, content, type, created_at)
VALUES 
  (NULL, '시스템 점검 안내', '2023년 6월 1일 오전 2시부터 4시까지 시스템 점검이 예정되어 있습니다.', 'system', NOW() - INTERVAL '2 days'),
  (NULL, '신규 서비스 출시', '인스타그램 팔로워 증가 서비스가 새롭게 출시되었습니다.', 'system', NOW() - INTERVAL '1 day'),
  (NULL, '결제 시스템 업데이트', '결제 시스템이 업데이트되었습니다. 이제 더 다양한 결제 방법을 이용하실 수 있습니다.', 'payment', NOW() - INTERVAL '12 hours');
