-- 기존 테이블이 있으면 삭제
DROP TABLE IF EXISTS consultations;

-- 테이블 생성
CREATE TABLE consultations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  service_type TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책 설정
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous insert" ON consultations;
CREATE POLICY "Allow anonymous insert" ON consultations FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anonymous select" ON consultations;
CREATE POLICY "Allow anonymous select" ON consultations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service role full access" ON consultations;
CREATE POLICY "Allow service role full access" ON consultations USING (true) WITH CHECK (true);

-- 샘플 데이터 추가
INSERT INTO consultations (name, email, phone, company, service_type, message, status, created_at)
VALUES 
('홍길동', 'hong@example.com', '010-1234-5678', '홍길동 주식회사', '인스타그램 마케팅', '인스타그램 마케팅 서비스에 대해 상담받고 싶습니다.', 'pending', NOW()),
('김철수', 'kim@example.com', '010-2345-6789', '김철수 엔터프라이즈', '페이스북 마케팅', '페이스북 광고 집행에 대해 문의드립니다.', 'in_progress', NOW() - INTERVAL '1 day'),
('이영희', 'lee@example.com', '010-3456-7890', NULL, '유튜브 마케팅', '유튜브 채널 성장을 위한 전략이 필요합니다.', 'completed', NOW() - INTERVAL '3 day');
