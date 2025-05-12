-- 기존 테이블이 있으면 삭제
DROP TABLE IF EXISTS public.consultations;

-- 단순화된 테이블 생성 (RLS 없이)
CREATE TABLE public.consultations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  service_type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 비활성화
ALTER TABLE public.consultations DISABLE ROW LEVEL SECURITY;
