-- point_history 테이블 생성 함수 추가
CREATE OR REPLACE FUNCTION create_point_history_table()
RETURNS void AS $$
BEGIN
  -- 테이블이 없는 경우에만 생성
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'point_history') THEN
    CREATE TABLE public.point_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- 인덱스 생성
    CREATE INDEX idx_point_history_user_id ON public.point_history(user_id);
    CREATE INDEX idx_point_history_created_at ON public.point_history(created_at);
  END IF;
END;
$$ LANGUAGE plpgsql;
