-- 상담신청 테이블 생성 함수
CREATE OR REPLACE FUNCTION create_consultations_table()
RETURNS void AS $$
BEGIN
  -- 테이블이 없는 경우에만 생성
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'consultations') THEN
    CREATE TABLE public.consultations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      company VARCHAR(100),
      service_type VARCHAR(100),
      message TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- 모든 사용자가 테이블에 접근할 수 있도록 RLS 정책 설정
    ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow anonymous insert" ON public.consultations FOR INSERT TO anon WITH CHECK (true);
    CREATE POLICY "Allow service role full access" ON public.consultations USING (true) WITH CHECK (true);
  END IF;
END;
$$ LANGUAGE plpgsql;
