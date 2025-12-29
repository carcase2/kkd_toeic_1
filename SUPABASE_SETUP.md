# Supabase 데이터베이스 설정 가이드

## 1. Supabase 테이블 생성

Supabase 대시보드에서 다음 SQL을 실행하여 테이블을 생성하세요:

```sql
-- words 테이블 생성
CREATE TABLE words (
  id BIGSERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  word TEXT NOT NULL,
  meaning TEXT NOT NULL,
  example TEXT NOT NULL,
  example_meaning TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, word)
);

-- study_records 테이블 생성
CREATE TABLE study_records (
  id BIGSERIAL PRIMARY KEY,
  word_id BIGINT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  studied_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_words_date ON words(date);
CREATE INDEX idx_study_records_word_id ON study_records(word_id);
CREATE INDEX idx_study_records_studied_at ON study_records(studied_at);

-- RLS (Row Level Security) 정책 설정 (선택사항)
-- 모든 사용자가 읽고 쓸 수 있도록 설정
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on words" ON words
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on study_records" ON study_records
  FOR ALL USING (true) WITH CHECK (true);
```

## 2. 환경 변수 확인

`.env.local` 파일에 다음 환경 변수가 설정되어 있는지 확인하세요:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. 개발 서버 재시작

환경 변수를 변경한 후 개발 서버를 재시작하세요:

```bash
npm run dev
```

