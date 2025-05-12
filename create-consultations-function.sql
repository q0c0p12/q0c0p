-- 상담신청 테이블이 없는 경우 생성하는 함수
CREATE OR REPLACE FUNCTION create_consultations_table_if_not_exists()
RETURNS void AS $$
BEGIN
  -- 테이블이 존재하는지 확인
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'consultations'
  ) THEN
    -- 테이블 생성
    CREATE TABLE public.consultations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      company TEXT,
      category_id TEXT,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- RLS 정책 설정
    ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
    
    -- 관리자만 모든 상담신청을 볼 수 있도록 정책 설정
    CREATE POLICY "관리자만 모든 상담신청 조회 가능" ON public.consultations
      FOR SELECT USING (
        auth.uid() IN (
          SELECT id FROM public.profiles WHERE is_admin = true
        )
      );
      
    -- 모든 사용자가 상담신청을 추가할 수 있도록 정책 설정
    CREATE POLICY "모든 사용자 상담신청 추가 가능" ON public.consultations
      FOR INSERT WITH CHECK (true);
      
    -- 관리자만 상담신청을 수정할 수 있도록 정책 설정
    CREATE POLICY "관리자만 상담신청 수정 가능" ON public.consultations
      FOR UPDATE USING (
        auth.uid() IN (
          SELECT id FROM public.profiles WHERE is_admin = true
        )
      );
  END IF;
END;
$$ LANGUAGE plpgsql;
