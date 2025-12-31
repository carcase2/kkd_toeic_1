export interface Word {
  id: number;
  date: string;
  word: string;
  meaning: string;
  example: string;
  example_meaning: string;
  created_at: string;
  is_incorrect?: boolean;
}

export interface StudyRecord {
  id: number;
  word_id: number;
  studied_at: string;
}

export interface WordWithStats extends Word {
  study_count: number;
  last_studied?: string;
}


