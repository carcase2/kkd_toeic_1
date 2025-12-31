-- 사용자별 오답 단어 테이블 생성
CREATE TABLE IF NOT EXISTS incorrect_words (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  word_id BIGINT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_incorrect_words_user_id ON incorrect_words(user_id);
CREATE INDEX IF NOT EXISTS idx_incorrect_words_word_id ON incorrect_words(word_id);

-- 기존 words 테이블의 is_incorrect 필드는 더 이상 사용하지 않음 (선택적으로 제거 가능)
-- ALTER TABLE words DROP COLUMN IF EXISTS is_incorrect;

