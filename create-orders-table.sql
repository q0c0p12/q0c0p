-- orders 테이블이 없는 경우 생성
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(255) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  service_id INTEGER NOT NULL,
  package_id VARCHAR(255),
  service_title VARCHAR(255) NOT NULL,
  package_name VARCHAR(255),
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  link TEXT NOT NULL,
  instructions TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
