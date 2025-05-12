-- profiles 테이블이 없으면 생성
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  full_name VARCHAR(255),
  balance INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  total_charged INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
