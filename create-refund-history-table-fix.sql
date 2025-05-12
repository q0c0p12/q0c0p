-- 환불 내역을 저장할 테이블 생성
CREATE TABLE IF NOT EXISTS refund_history (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  user_id UUID NOT NULL,
  refund_amount DECIMAL(10, 2) NOT NULL,
  refund_quantity INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_order
    FOREIGN KEY(order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE,
    
  CONSTRAINT fk_user
    FOREIGN KEY(user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_refund_history_order_id ON refund_history(order_id);
CREATE INDEX IF NOT EXISTS idx_refund_history_user_id ON refund_history(user_id);
