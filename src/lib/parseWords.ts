export interface ParsedWord {
  word: string;
  meaning: string;
  example: string;
  example_meaning: string;
  day?: number; // Day 번호 (Day 3, Day 4 등)
}

export function parseWords(text: string): ParsedWord[] {
  const words: ParsedWord[] = [];
  const allLines = text.split('\n').map(line => line.trim());
  
  // 번역 섹션 찾기 (별도 섹션 형식)
  let translationSectionStart = -1;
  const translations = new Map<number, string>(); // 번호를 키로 사용하는 Map
  
  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i];
    // "예시 번역", "번역" 섹션 제목 찾기 (별도 섹션 형식)
    // 단순히 "번역"이 포함된 것이 아니라 섹션 제목으로만 인식
    if (/^[*\s]*예시\s*번역[*\s]*$|^[*\s]*번역[*\s]*$|^[*\s]*Translation[*\s]*$/i.test(line)) {
      translationSectionStart = i + 1;
      break;
    }
  }
  
  // 번역 섹션이 있으면 번역 추출 (별도 섹션 형식)
  if (translationSectionStart > 0) {
    for (let i = translationSectionStart; i < allLines.length; i++) {
      const line = allLines[i];
      if (line.length === 0) continue;
      
      // 번호로 시작하는 줄이 번역 (예: "1. 번역 내용")
      const translationMatch = line.match(/^(\d+)\.\s*(.+)$/);
      if (translationMatch) {
        const num = parseInt(translationMatch[1]);
        const translation = translationMatch[2].trim();
        translations.set(num, translation);
      }
    }
  }
  
  // 단어 섹션 파싱 (번역 섹션 이전까지)
  const wordSectionEnd = translationSectionStart > 0 ? translationSectionStart - 1 : allLines.length;
  const wordSectionLines = allLines.slice(0, wordSectionEnd);
  
  let i = 0;
  let currentDay: number | null = null;
  
  while (i < wordSectionLines.length) {
    const line = wordSectionLines[i];
    
    // 빈 줄 건너뛰기
    if (line.length === 0) {
      i++;
      continue;
    }
    
    // Day X 형식 감지 (예: "**Day 3**", "Day 3", "**Day 3**")
    const dayMatch = line.match(/^[*\s]*Day\s+(\d+)[*\s]*$/i);
    if (dayMatch) {
      currentDay = parseInt(dayMatch[1]);
      i++;
      continue;
    }
    
    // 패턴 1: "1. **word** – meaning" 형식
    const pattern1 = /^(\d+)\.\s*\*\*(.+?)\*\*\s*[–-]\s*(.+)$/;
    // 패턴 2: "1. word – meaning" 형식
    const pattern2 = /^(\d+)\.\s*(.+?)\s*[–-]\s*(.+)$/;
    
    const match = line.match(pattern1) || line.match(pattern2);
    
    if (match) {
      // 단어 번호 추출
      const wordNumber = parseInt(match[1]);
      const word = match[2].trim();
      const meaning = match[3].trim();
      
      let example = '';
      let example_meaning = '';
      
      // 다음 줄 찾기 (빈 줄 건너뛰기)
      let nextIndex = i + 1;
      while (nextIndex < wordSectionLines.length && wordSectionLines[nextIndex].length === 0) {
        nextIndex++;
      }
      
      // 예시 문장 찾기
      if (nextIndex < wordSectionLines.length) {
        const nextLine = wordSectionLines[nextIndex];
        // 다음 줄이 숫자로 시작하지 않으면 예시 문장
        if (!/^\d+\./.test(nextLine)) {
          example = nextLine;
          
          // 그 다음 줄 찾기 (빈 줄 건너뛰기)
          let translationIndex = nextIndex + 1;
          while (translationIndex < wordSectionLines.length && wordSectionLines[translationIndex].length === 0) {
            translationIndex++;
          }
          
          // 번역 찾기
          if (translationIndex < wordSectionLines.length) {
            const translationLine = wordSectionLines[translationIndex];
            // 숫자로 시작하지 않고, 한글이 포함되어 있으면 번역으로 간주
            if (!/^\d+\./.test(translationLine) && /[가-힣]/.test(translationLine)) {
              example_meaning = translationLine;
              i = translationIndex + 1;
            } else {
              i = nextIndex + 1;
            }
          } else {
            i = nextIndex + 1;
          }
        } else {
          i = nextIndex;
        }
      } else {
        i = nextIndex;
      }
      
      // 번역이 아직 없고, 번역 섹션이 있으면 번역 섹션에서 찾기
      if (!example_meaning && translations.has(wordNumber)) {
        example_meaning = translations.get(wordNumber)!;
      }
      
      // 번역이 없으면 예시 문장을 번역으로 사용
      if (!example_meaning && example) {
        example_meaning = example;
      }
      
      if (word && meaning && example) {
        words.push({
          word,
          meaning,
          example,
          example_meaning: example_meaning || example,
          day: currentDay || undefined,
        });
      }
    } else {
      i++;
    }
  }

  return words;
}
