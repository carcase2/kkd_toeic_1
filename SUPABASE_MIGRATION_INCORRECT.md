# Supabase 데이터베이스 마이그레이션: 오답 기능 추가

## words 테이블에 is_incorrect 필드 추가

Supabase 대시보드의 SQL Editor에서 다음 SQL을 실행하여 오답 필드를 추가하세요:

**중요**: `SUPABASE_MIGRATION_INCORRECT.sql` 파일의 내용을 복사해서 실행하거나, 아래 SQL을 직접 실행하세요.

```sql
-- words 테이블에 is_incorrect 필드 추가
ALTER TABLE words ADD COLUMN IF NOT EXISTS is_incorrect BOOLEAN DEFAULT FALSE;

-- 인덱스 생성 (오답 단어 조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_words_is_incorrect ON words(is_incorrect) WHERE is_incorrect = TRUE;
```

## 실행 방법

1. Supabase 대시보드 접속
2. 왼쪽 메뉴에서 "SQL Editor" 클릭
3. "New query" 클릭
4. 위의 SQL 코드를 복사해서 붙여넣기
5. "Run" 버튼 클릭

## 기존 데이터 처리

기존 단어들은 모두 `is_incorrect = FALSE`로 설정됩니다.

