-- balance_requests 테이블에 depositor 컬럼 추가
ALTER TABLE public.balance_requests 
ADD COLUMN IF NOT EXISTS depositor VARCHAR(100);
