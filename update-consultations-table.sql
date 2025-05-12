-- consultations 테이블의 user_id 필드를 NULL 허용으로 변경
ALTER TABLE consultations ALTER COLUMN user_id DROP NOT NULL;
