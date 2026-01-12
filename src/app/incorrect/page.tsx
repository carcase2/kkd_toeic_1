'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Word } from '@/types';
import StudyCard from '@/components/StudyCard';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function IncorrectPage() {
  const pathname = usePathname();
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studiedCount, setStudiedCount] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [wordDelay, setWordDelay] = useState(1);
  const [sentenceDelay, setSentenceDelay] = useState(3);
  const [showTimeSettings, setShowTimeSettings] = useState(false);
  const [continuousMode, setContinuousMode] = useState(true);

  // 경로 변경 시 또는 페이지 마운트 시 단어 목록 새로고침
  useEffect(() => {
    loadWords();
  }, [pathname]);

  // 페이지 포커스 시 단어 목록 새로고침 (다른 탭에서 오답 체크한 경우 반영)
  useEffect(() => {
    const handleFocus = () => {
      loadWords();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadWords = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('loadWords: No userId found in localStorage');
        return;
      }
      console.log(`loadWords: Fetching incorrect words for user_id: ${userId}`);
      const response = await fetch(`/api/words/incorrect?user_id=${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('loadWords: API error:', errorData);
        alert(`오답 단어를 불러오는데 실패했습니다: ${errorData.error || '알 수 없는 오류'}`);
        return;
      }
      
      const data = await response.json();
      console.log(`loadWords: Received ${data.length} incorrect words`);
      // 무작위로 섞기
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setWords(shuffled);
      setCurrentIndex(0);
      setStudiedCount(0);
    } catch (error) {
      console.error('Error loading incorrect words:', error);
      alert('오답 단어를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      
      // 연속 모드이고 남은 단어가 3개 이하면 다시 로드
      if (continuousMode && currentIndex >= words.length - 3) {
        loadMoreWords();
      }
    } else {
      if (continuousMode) {
        // 연속 모드: 다음 단어 로드
        loadMoreWords();
        setCurrentIndex(currentIndex + 1);
      } else {
        // 일반 모드: 모든 단어 학습 완료
        alert('모든 오답 단어를 학습했습니다! 🎉');
        loadWords(); // 새로운 세트 로드
      }
    }
  };

  const loadMoreWords = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      const response = await fetch(`/api/words/incorrect?user_id=${userId}`);
      const data = await response.json();
      // 무작위로 섞기
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setWords(prev => [...prev, ...shuffled]);
    } catch (error) {
      console.error('Error loading more incorrect words:', error);
    }
  };

  const handleStudy = () => {
    setStudiedCount(prev => prev + 1);
  };

  const handleStart = () => {
    setIsPaused(false);
  };

  if (words.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-8">
          <div className="max-w-4xl mx-auto">
            <Navigation />
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <p className="text-xl text-gray-600">오답으로 표시된 단어가 없습니다.</p>
              <p className="text-sm text-gray-500 mt-2">학습 중 단어에 오답 체크를 하면 여기서 다시 학습할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <Navigation />
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6 text-center">
          오답 단어 학습
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap gap-2 flex-1">
              <label className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer text-xs sm:text-sm ${
                continuousMode
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`} title="연속 재생">
                <input
                  type="checkbox"
                  checked={continuousMode}
                  onChange={(e) => setContinuousMode(e.target.checked)}
                  className="sr-only"
                />
                {continuousMode ? (
                  <>
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>연속재생</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="hidden sm:inline">연속재생</span>
                  </>
                )}
              </label>
              {continuousMode && (
                <button
                  onClick={() => {
                    setContinuousMode(false);
                  }}
                  className="px-2 sm:px-3 py-2 rounded-lg font-semibold transition-colors flex items-center gap-1 text-xs sm:text-sm bg-red-500 text-white hover:bg-red-600"
                  title="연속 재생 정지"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline">정지</span>
                </button>
              )}
              <div className="relative">
                <button
                  onClick={() => setAutoPlay(!autoPlay)}
                  className={`px-2 sm:px-3 py-2 rounded-lg font-semibold transition-colors flex items-center gap-1 text-xs sm:text-sm ${
                    autoPlay
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                  title={autoPlay ? '자동 재생 끄기' : '자동 재생 켜기'}
                >
                  {autoPlay ? (
                    <>
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="hidden sm:inline">자동재생</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      <span className="hidden sm:inline">재생</span>
                    </>
                  )}
                </button>
                {autoPlay && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTimeSettings(!showTimeSettings);
                    }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                    title="시간 설정"
                  >
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="text-gray-600">
                {currentIndex + 1} / {words.length}
              </p>
              <p className="text-green-600 font-semibold">
                오늘 학습: {studiedCount}개
              </p>
            </div>
          </div>
          {showTimeSettings && (
            <div className="mt-3 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    단어 → 발음 시간 (초)
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={wordDelay}
                    onChange={(e) => setWordDelay(parseFloat(e.target.value))}
                    className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    문장 → 발음 시간 (초)
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={sentenceDelay}
                    onChange={(e) => setSentenceDelay(parseFloat(e.target.value))}
                    className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {words[currentIndex] && (
          <StudyCard
            word={words[currentIndex]}
            onNext={handleNext}
            onStudy={handleStudy}
            autoPlay={autoPlay}
            isPaused={isPaused}
            onStart={handleStart}
            wordDelay={wordDelay}
            sentenceDelay={sentenceDelay}
          />
        )}

        {/* 오답 해제 버튼 */}
        <div className="mt-6 text-center">
          <button
            onClick={async () => {
              if (words[currentIndex]) {
                try {
                  const userId = localStorage.getItem('userId');
                  if (!userId) return;
                  const response = await fetch('/api/words/incorrect', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ word_id: words[currentIndex].id, is_incorrect: false, user_id: userId }),
                  });

                  if (response.ok) {
                    // 목록에서 제거
                    const newWords = words.filter(w => w.id !== words[currentIndex].id);
                    setWords(newWords);
                    
                    // 인덱스 조정
                    if (newWords.length === 0) {
                      setCurrentIndex(0);
                    } else if (currentIndex >= newWords.length) {
                      setCurrentIndex(newWords.length - 1);
                    }
                  }
                } catch (error) {
                  console.error('Error removing from incorrect:', error);
                }
              }
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
          >
            오답 해제
          </button>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}

