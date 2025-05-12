-- 기존 주문 데이터 확인
SELECT * FROM orders LIMIT 5;

-- 테스트 주문 데이터 삽입
INSERT INTO orders (user_id, total_amount, status, created_at, updated_at)
VALUES 
('00000000-0000-0000-0000-000000000001', 50000, 'pending', NOW(), NOW()),
('00000000-0000-0000-0000-000000000001', 75000, 'completed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('00000000-0000-0000-0000-000000000001', 120000, 'processing', NOW() - INTERVAL '2 day', NOW() - INTERVAL '2 day'),
('00000000-0000-0000-0000-000000000001', 35000, 'cancelled', NOW() - INTERVAL '3 day', NOW() - INTERVAL '3 day');

-- 삽입 후 주문 데이터 확인
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;
