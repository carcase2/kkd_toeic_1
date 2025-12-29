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

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // 모든 단어 학습 완료
      alert('모든 단어를 학습했습니다! 🎉');
      loadWords(); // 새로운 세트 로드
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          단어 학습
        </h1>

        <Navigation />

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-4">
              <button
                onClick={() => setStudyType('today')}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  studyType === 'today'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                금일 단어
              </button>
              <button
                onClick={() => setStudyType('random')}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  studyType === 'random'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                랜덤 단어
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                설정
              </button>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {currentIndex + 1} / {words.length}
              </p>
              <p className="text-sm text-green-600 font-semibold">
                오늘 학습: {studiedCount}개
              </p>
            </div>
          </div>

          {showSettings && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="mb-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoPlay}
                    onChange={(e) => setAutoPlay(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="font-semibold text-gray-700">자동 재생</span>
                </label>
              </div>

              {autoPlay && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      단어 → 뜻 시간 (초)
                    </label>
                    <input
                      type="number"
                      min="0.5"
                      max="10"
                      step="0.5"
                      value={wordDelay}
                      onChange={(e) => setWordDelay(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      문장 → 번역 시간 (초)
                    </label>
                    <input
                      type="number"
                      min="0.5"
                      max="10"
                      step="0.5"
                      value={sentenceDelay}
                      onChange={(e) => setSentenceDelay(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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


