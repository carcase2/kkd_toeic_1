-- users 테이블에 password 필드 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;

-- 비밀번호가 있는 사용자만 비밀번호로 로그인 가능하도록 설정

