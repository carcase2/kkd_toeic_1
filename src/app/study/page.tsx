'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import StudyCard from '@/components/StudyCard';
import Navigation from '@/components/Navigation';
import { Word } from '@/types';

export default function StudyPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studyType, setStudyType] = useState<'today' | 'random'>('today');
  const [studiedCount, setStudiedCount] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true); // 기본값 true
  const [isPaused, setIsPaused] = useState(true); // 처음에는 일시정지 상태
  const [wordDelay, setWordDelay] = useState(1); // 단어 표시 후 뜻까지 시간 (초)
  const [sentenceDelay, setSentenceDelay] = useState(3); // 문장 표시 후 번역까지 시간 (초)
  const [showSettings, setShowSettings] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false); // 연속 모드

  useEffect(() => {
    loadWords();
  }, [studyType]);

  const loadWords = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      if (studyType === 'today') {
        const response = await fetch(`/api/words?date=${today}`);
        const data = await response.json();
        // 무작위로 섞기
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setWords(shuffled);
      } else {
        const response = await fetch('/api/words/random');
        const data = await response.json();
        setWords(data);
      }
      setCurrentIndex(0);
      setStudiedCount(0);
      setIsPaused(true); // 새로운 단어 세트 로드 시 일시정지 상태로
    } catch (error) {
      console.error('Error loading words:', error);
    }
  };

  const loadMoreWords = async () => {
    try {
      const response = await fetch('/api/words/random?limit=10');
      const data = await response.json();
      setWords(prev => [...prev, ...data]);
    } catch (error) {
      console.error('Error loading more words:', error);
    }
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      
      // 연속 모드이고 남은 단어가 3개 이하면 미리 로드
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
        alert('모든 단어를 학습했습니다! 🎉');
        loadWords(); // 새로운 세트 로드
      }
    }
  };

  const handleStudy = () => {
    setStudiedCount(studiedCount + 1);
  };

  if (words.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Navigation />
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-xl text-gray-600 mb-4">
              {studyType === 'today' ? '오늘 등록된 단어가 없습니다.' : '등록된 단어가 없습니다.'}
            </p>
            <button
              onClick={() => (window.location.href = '/')}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              달력으로 가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-4xl font-bold text-center mb-4 sm:mb-8 text-gray-800">
          단어 학습
        </h1>

        <Navigation />

        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap gap-2 flex-1">
              <button
                onClick={() => setStudyType('today')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                  studyType === 'today'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                금일 단어
              </button>
              <div className="relative">
                <button
                  onClick={() => setStudyType('random')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                    studyType === 'random'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  랜덤 단어
                </button>
                {studyType === 'random' && (
                  <label className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-green-500 rounded-full cursor-pointer hover:bg-green-600 transition-colors">
                    <input
                      type="checkbox"
                      checked={continuousMode}
                      onChange={(e) => setContinuousMode(e.target.checked)}
                      className="sr-only"
                    />
                    {continuousMode ? (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-white text-xs">+</span>
                    )}
                  </label>
                )}
              </div>
              <button
                onClick={() => setAutoPlay(!autoPlay)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-1 sm:gap-2 text-sm ${
                  autoPlay
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
                title={autoPlay ? '자동 재생 끄기' : '자동 재생 켜기'}
              >
                {autoPlay ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="hidden sm:inline">자동재생</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    <span className="hidden sm:inline">재생</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-3 sm:px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors flex items-center gap-1 sm:gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden sm:inline">설정</span>
              </button>
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

          {showSettings && (
            <div className="mt-3 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoPlay}
                    onChange={(e) => setAutoPlay(e.target.checked)}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded"
                  />
                  <span className="font-semibold text-gray-700 text-sm sm:text-base">자동 재생</span>
                </label>
              </div>

              {autoPlay && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      단어 → 뜻 시간 (초)
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
                      문장 → 번역 시간 (초)
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
              )}
            </div>
          )}
        </div>

        <StudyCard
          word={words[currentIndex]}
          onNext={handleNext}
          onStudy={handleStudy}
          autoPlay={autoPlay}
          isPaused={isPaused}
          onStart={() => setIsPaused(false)}
          wordDelay={wordDelay}
          sentenceDelay={sentenceDelay}
        />
      </div>
    </div>
  );
}


