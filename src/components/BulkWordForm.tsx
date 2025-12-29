'use client';

import { useState } from 'react';
import { parseWords } from '@/lib/parseWords';
import { format, addDays } from 'date-fns';

interface BulkWordFormProps {
  date: string;
  onSave: () => void;
  onClose: () => void;
}

export default function BulkWordForm({ date, onSave, onClose }: BulkWordFormProps) {
  const [text, setText] = useState('');
  const [parsedWords, setParsedWords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [distributionMode, setDistributionMode] = useState<'single' | 'multiple'>('single');
  const [startDate, setStartDate] = useState(date);
  const [wordsPerDay, setWordsPerDay] = useState(10);

  const handleParse = () => {
    const words = parseWords(text);
    setParsedWords(words);
  };

  const handleSave = async () => {
    if (parsedWords.length === 0) {
      alert('파싱된 단어가 없습니다. 텍스트를 입력하고 "파싱" 버튼을 클릭하세요.');
      return;
    }

    setIsLoading(true);
    try {
      let successCount = 0;
      let failCount = 0;
      const dateCounts: Record<string, number> = {};

      if (distributionMode === 'multiple') {
        // 여러 날짜에 분배
        let currentDate = new Date(startDate);
        let wordIndex = 0;
        let dayWordCount = 0;
        let lastDay: number | null = null;

        // Day 정보가 있는지 확인
        const hasDayInfo = parsedWords.some(w => w.day !== undefined);
        
        if (hasDayInfo) {
          // Day 정보를 사용하여 분배
          const dayGroups = new Map<number, typeof parsedWords>();
          
          for (const word of parsedWords) {
            if (word.day) {
              if (!dayGroups.has(word.day)) {
                dayGroups.set(word.day, []);
              }
              dayGroups.get(word.day)!.push(word);
            }
          }
          
          // Day 번호 순서대로 정렬
          const sortedDays = Array.from(dayGroups.keys()).sort((a, b) => a - b);
          const firstDay = sortedDays[0];
          
          // 첫 번째 Day를 시작 날짜로 매핑
          for (const dayNum of sortedDays) {
            const daysOffset = dayNum - firstDay;
            const targetDate = addDays(new Date(startDate), daysOffset);
            const dateStr = format(targetDate, 'yyyy-MM-dd');
            
            const wordsInDay = dayGroups.get(dayNum) || [];
            for (const word of wordsInDay) {
              try {
                const response = await fetch('/api/words', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    word: word.word,
                    meaning: word.meaning,
                    example: word.example,
                    example_meaning: word.example_meaning,
                    date: dateStr,
                  }),
                });

                if (response.ok) {
                  successCount++;
                  dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
                } else {
                  failCount++;
                }
              } catch (error) {
                failCount++;
              }
            }
          }
        } else {
          // Day 정보가 없으면 기존 방식 (단어 개수 기준 분배)
          for (const word of parsedWords) {
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            
            try {
              const response = await fetch('/api/words', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  word: word.word,
                  meaning: word.meaning,
                  example: word.example,
                  example_meaning: word.example_meaning,
                  date: dateStr,
                }),
              });

              if (response.ok) {
                successCount++;
                dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
                dayWordCount++;
              } else {
                failCount++;
              }
            } catch (error) {
              failCount++;
            }

            wordIndex++;
            
            // 하루치 단어 개수에 도달하면 다음 날로
            if (dayWordCount >= wordsPerDay) {
              currentDate = addDays(currentDate, 1);
              dayWordCount = 0;
            }
          }
        }

        const dateSummary = Object.entries(dateCounts)
          .map(([date, count]) => `${format(new Date(date), 'MM월 dd일')}: ${count}개`)
          .join('\n');

        if (successCount > 0) {
          alert(
            `총 ${successCount}개의 단어가 등록되었습니다.\n\n` +
            `날짜별 분배:\n${dateSummary}` +
            (failCount > 0 ? `\n\n${failCount}개 실패` : '')
          );
        } else {
          alert('단어 등록에 실패했습니다.');
        }
      } else {
        // 단일 날짜에 등록
        for (const word of parsedWords) {
          try {
            const response = await fetch('/api/words', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...word,
                date,
              }),
            });

            if (response.ok) {
              successCount++;
            } else {
              failCount++;
            }
          } catch (error) {
            failCount++;
          }
        }

        if (successCount > 0) {
          alert(`${successCount}개의 단어가 등록되었습니다.${failCount > 0 ? ` (${failCount}개 실패)` : ''}`);
        } else {
          alert('단어 등록에 실패했습니다.');
        }
      }

      if (successCount > 0) {
        onSave();
        onClose();
      }
    } catch (error) {
      console.error('Error saving words:', error);
      alert('단어 등록에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">일괄 단어 등록</h2>
        
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 mb-2">
            <strong>사용 방법:</strong>
          </p>
          <p className="text-sm text-blue-700">
            아래 형식으로 텍스트를 붙여넣으세요:
          </p>
          <pre className="text-xs text-blue-600 mt-2 bg-white p-2 rounded border">
{`1. **contemplate** – 숙고하다
   She contemplated changing careers after 10 years.
   그녀는 10년 만에 직업 변경을 숙고했다.

2. **implement** – 실행하다
   The system will be implemented in phases.
   시스템은 단계적으로 실행될 것이다.`}
          </pre>
        </div>

        <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            등록 방식 선택
          </label>
          <div className="flex gap-4 mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="distribution"
                value="single"
                checked={distributionMode === 'single'}
                onChange={(e) => setDistributionMode(e.target.value as 'single' | 'multiple')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">단일 날짜에 등록</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="distribution"
                value="multiple"
                checked={distributionMode === 'multiple'}
                onChange={(e) => setDistributionMode(e.target.value as 'single' | 'multiple')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">여러 날짜에 자동 분배</span>
            </label>
          </div>
          
          {distributionMode === 'multiple' && (
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  시작 날짜
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  하루당 단어 개수
                </label>
                <input
                  type="number"
                  value={wordsPerDay}
                  onChange={(e) => setWordsPerDay(parseInt(e.target.value) || 10)}
                  min="1"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
          
          {distributionMode === 'multiple' && parsedWords.length > 0 && (
            <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
              💡 {parsedWords.length}개 단어를 {wordsPerDay}개씩 나누면{' '}
              {Math.ceil(parsedWords.length / wordsPerDay)}일치로 등록됩니다.
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            텍스트 붙여넣기
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            rows={12}
            placeholder="위 형식으로 텍스트를 붙여넣으세요..."
          />
        </div>

        <div className="flex gap-3 mb-4">
          <button
            onClick={handleParse}
            className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-600 transition-colors"
          >
            파싱하기
          </button>
        </div>

        {parsedWords.length > 0 && (
          <div className="mb-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
              <p className="text-sm text-green-800 font-semibold">
                {parsedWords.length}개의 단어가 파싱되었습니다.
              </p>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
              {parsedWords.map((word, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                  <div className="font-bold text-blue-600">{word.word}</div>
                  <div className="text-gray-600">{word.meaning}</div>
                  <div className="text-gray-500 text-xs mt-1">{word.example}</div>
                  {word.example_meaning && word.example_meaning !== word.example && (
                    <div className="text-gray-400 text-xs mt-1 italic">{word.example_meaning}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSave}
            disabled={isLoading || parsedWords.length === 0}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? '저장 중...' : `${parsedWords.length}개 단어 등록`}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

