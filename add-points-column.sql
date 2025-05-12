-- profiles 테이블에 points 컬럼이 없는지 확인
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'points'
    ) THEN
        -- points 컬럼 추가
        ALTER TABLE profiles ADD COLUMN points INTEGER DEFAULT 0;
        RAISE NOTICE 'points 컬럼이 추가되었습니다.';
    ELSE
        RAISE NOTICE 'points 컬럼이 이미 존재합니다.';
    END IF;
END $$;

-- point_history 테이블이 없는지 확인
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'point_history'
    ) THEN
        -- point_history 테이블 생성
        CREATE TABLE point_history (
            id SERIAL PRIMARY KEY,
            user_id UUID NOT NULL,
            amount INTEGER NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'point_history 테이블이 생성되었습니다.';
    ELSE
        RAISE NOTICE 'point_history 테이블이 이미 존재합니다.';
    END IF;
END $$;

-- 테스트 데이터 추가
INSERT INTO profiles (id, full_name, points)
VALUES 
    ('test_user_1', '테스트 사용자 1', 5000),
    ('test_user_2', '테스트 사용자 2', 3000),
    ('test_user_3', '테스트 사용자 3', 1000)
ON CONFLICT (id) 
DO UPDATE SET points = EXCLUDED.points;

RAISE NOTICE '테스트 사용자 데이터가 추가되었습니다.';
