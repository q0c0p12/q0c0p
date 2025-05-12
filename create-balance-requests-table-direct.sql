-- balance_requests 테이블 생성
CREATE TABLE IF NOT EXISTS public.balance_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  depositor VARCHAR(100),
  payment_method VARCHAR(50) DEFAULT '계좌이체',
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID
);

-- RLS 활성화
ALTER TABLE public.balance_requests ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있을 경우)
DROP POLICY IF EXISTS "Users can view their own charge requests" ON public.balance_requests;
DROP POLICY IF EXISTS "Users can create their own charge requests" ON public.balance_requests;
DROP POLICY IF EXISTS "Admins can view all charge requests" ON public.balance_requests;
DROP POLICY IF EXISTS "Admins can update all charge requests" ON public.balance_requests;

-- 사용자는 자신의 충전 요청만 볼 수 있음
CREATE POLICY "Users can view their own charge requests"
  ON public.balance_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 자신의 충전 요청만 생성할 수 있음
CREATE POLICY "Users can create their own charge requests"
  ON public.balance_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 관리자는 모든 충전 요청을 볼 수 있음
CREATE POLICY "Admins can view all charge requests"
  ON public.balance_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- 관리자는 모든 충전 요청을 업데이트할 수 있음
CREATE POLICY "Admins can update all charge requests"
  ON public.balance_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
