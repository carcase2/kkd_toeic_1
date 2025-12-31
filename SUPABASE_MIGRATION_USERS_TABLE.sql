-- kks_users 테이블 생성 (아이디와 비밀번호 저장)
CREATE TABLE IF NOT EXISTS kks_users (
  id TEXT PRIMARY KEY,
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (선택사항)
CREATE INDEX IF NOT EXISTS idx_kks_users_id ON kks_users(id);

