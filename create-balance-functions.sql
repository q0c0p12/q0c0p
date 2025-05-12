-- 충전 요청 테이블 생성
CREATE TABLE IF NOT EXISTS charge_requests (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50) NOT NULL,
  depositor_name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 알림 테이블 생성
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 거래 내역 테이블 생성
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount INTEGER NOT NULL,
  type VARCHAR(20) NOT NULL,
  method VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 거래 내역 조회 함수
CREATE OR REPLACE FUNCTION get_user_transactions(p_user_id UUID)
RETURNS TABLE (
  id INTEGER,
  amount INTEGER,
  type VARCHAR(20),
  method VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.amount,
    t.type,
    t.method,
    t.description,
    t.created_at
  FROM transactions t
  WHERE t.user_id = p_user_id
  ORDER BY t.created_at DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- 충전 요청 생성 함수
CREATE OR REPLACE FUNCTION create_charge_request(
  p_user_id UUID,
  p_amount INTEGER,
  p_payment_method VARCHAR(50),
  p_depositor_name VARCHAR(100) DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_request_id INTEGER;
BEGIN
  -- 충전 요청 생성
  INSERT INTO charge_requests (
    user_id,
    amount,
    payment_method,
    depositor_name
  ) VALUES (
    p_user_id,
    p_amount,
    p_payment_method,
    p_depositor_name
  ) RETURNING id INTO v_request_id;
  
  -- 알림 생성 (관리자에게)
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    related_id
  )
  SELECT 
    id,
    '새로운 충전 요청',
    '사용자가 ' || p_amount || '원 충전을 요청했습니다.',
    'charge_request',
    v_request_id
  FROM profiles
  WHERE is_admin = TRUE;
  
  -- 알림 생성 (사용자에게)
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    related_id
  ) VALUES (
    p_user_id,
    '충전 요청 접수',
    p_amount || '원 충전 요청이 접수되었습니다. 관리자 승인 후 처리됩니다.',
    'charge_request',
    v_request_id
  );
  
  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql;

-- 사용자 충전 요청 내역 조회 함수
CREATE OR REPLACE FUNCTION get_user_charge_requests(p_user_id UUID)
RETURNS TABLE (
  id INTEGER,
  amount INTEGER,
  status VARCHAR(20),
  payment_method VARCHAR(50),
  depositor_name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.id,
    cr.amount,
    cr.status,
    cr.payment_method,
    cr.depositor_name,
    cr.created_at
  FROM charge_requests cr
  WHERE cr.user_id = p_user_id
  ORDER BY cr.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 사용자 알림 조회 함수
CREATE OR REPLACE FUNCTION get_user_notifications(p_user_id UUID)
RETURNS TABLE (
  id INTEGER,
  title VARCHAR(255),
  message TEXT,
  type VARCHAR(50),
  is_read BOOLEAN,
  related_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.title,
    n.message,
    n.type,
    n.is_read,
    n.related_id,
    n.created_at
  FROM notifications n
  WHERE n.user_id = p_user_id
  ORDER BY n.created_at DESC;
END;
$$ LANGUAGE plpgsql;
