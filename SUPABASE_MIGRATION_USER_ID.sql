-- words 테이블에 user_id 필드 추가
ALTER TABLE words ADD COLUMN IF NOT EXISTS user_id TEXT;

-- study_records 테이블에 user_id 필드 추가
ALTER TABLE study_records ADD COLUMN IF NOT EXISTS user_id TEXT;

-- 인덱스 생성 (사용자별 조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_words_user_id ON words(user_id);
CREATE INDEX IF NOT EXISTS idx_study_records_user_id ON study_records(user_id);

-- 기존 데이터는 NULL로 유지 (선택적으로 기본 사용자로 설정 가능)
-- UPDATE words SET user_id = 'default' WHERE user_id IS NULL;
-- UPDATE study_records SET user_id = 'default' WHERE user_id IS NULL;

