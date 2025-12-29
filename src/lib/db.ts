import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'toeic_words.db');

// 데이터베이스 파일이 없으면 생성
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, '');
}

const db = new Database(dbPath);

// 단어 테이블 생성
db.exec(`
  CREATE TABLE IF NOT EXISTS words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    word TEXT NOT NULL,
    meaning TEXT NOT NULL,
    example TEXT NOT NULL,
    example_meaning TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, word)
  )
`);

// 학습 기록 테이블 생성
db.exec(`
  CREATE TABLE IF NOT EXISTS study_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word_id INTEGER NOT NULL,
    studied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (word_id) REFERENCES words(id)
  )
`);

// 인덱스 생성
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_words_date ON words(date);
  CREATE INDEX IF NOT EXISTS idx_study_records_word_id ON study_records(word_id);
  CREATE INDEX IF NOT EXISTS idx_study_records_studied_at ON study_records(studied_at);
`);

export default db;

