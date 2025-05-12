-- UUID 확장 설치
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 포인트 내역 테이블 생성
CREATE TABLE IF NOT EXISTS public.point_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  balance_request_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 및 정책 설정
ALTER TABLE public.point_history ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 포인트 내역만 볼 수 있음
CREATE POLICY "Users can view their own point history"
  ON public.point_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- 관리자는 모든 포인트 내역을 볼 수 있음
CREATE POLICY "Admins can view all point history"
  ON public.point_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- 관리자만 포인트 내역을 추가할 수 있음
CREATE POLICY "Admins can insert point history"
  ON public.point_history
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- 외래 키 제약 조건 추가
ALTER TABLE public.point_history
  ADD CONSTRAINT fk_point_history_user
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- 테스트 데이터 삽입 (선택 사항)
INSERT INTO public.point_history (user_id, amount, type, description)
SELECT 
  id, 
  10000, 
  'initial', 
  '초기 포인트 지급'
FROM 
  auth.users 
ORDER BY created_at 
LIMIT 1;
