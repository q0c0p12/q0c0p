-- 테스트 데이터 추가
INSERT INTO public.balance_requests (user_id, amount, status, payment_method, description)
SELECT 
  id, 
  10000, 
  'pending', 
  '계좌이체',
  '테스트 충전 요청'
FROM 
  public.profiles 
LIMIT 3;
