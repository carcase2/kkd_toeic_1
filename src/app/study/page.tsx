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
        </div>

        <StudyCard
          word={words[currentIndex]}
          onNext={handleNext}
          onStudy={handleStudy}
        />
      </div>
    </div>
  );
}


