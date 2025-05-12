-- 환불 내역을 기록하기 위한 테이블 생성
CREATE TABLE IF NOT EXISTS refund_history (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  user_id UUID NOT NULL,
  refund_amount DECIMAL(10, 2) NOT NULL,
  refund_quantity INTEGER NOT NULL,
  refund_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_refund_history_order_id ON refund_history(order_id);
CREATE INDEX IF NOT EXISTS idx_refund_history_user_id ON refund_history(user_id);
