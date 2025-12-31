-- words 테이블에 is_incorrect 필드 추가
ALTER TABLE words ADD COLUMN IF NOT EXISTS is_incorrect BOOLEAN DEFAULT FALSE;

-- 인덱스 생성 (오답 단어 조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_words_is_incorrect ON words(is_incorrect) WHERE is_incorrect = TRUE;



