'use client';

import { useState } from 'react';
import { Word } from '@/types';

interface StudyCardProps {
  word: Word;
  onNext: () => void;
  onStudy: () => void;
}

type CardState = 'word' | 'meaning' | 'example' | 'translation';

export default function StudyCard({ word, onNext, onStudy }: StudyCardProps) {
  const [state, setState] = useState<CardState>('word');
  const [isFlipping, setIsFlipping] = useState(false);

  const handleClick = () => {
    setIsFlipping(true);
    setTimeout(() => {
      if (state === 'word') {
        setState('meaning');
      } else if (state === 'meaning') {
        setState('example');
      } else if (state === 'example') {
        setState('translation');
      } else {
        // 학습 기록 저장
        fetch('/api/study', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ word_id: word.id }),
        });
        onStudy();
        onNext();
        setState('word');
      }
      setIsFlipping(false);
    }, 150);
  };

  const getContent = () => {
    switch (state) {
      case 'word':
        return { text: word.word, label: '단어' };
      case 'meaning':
        return { text: word.meaning, label: '뜻' };
      case 'example':
        return { text: word.example, label: '예시 문장' };
      case 'translation':
        return { text: word.example_meaning, label: '번역' };
    }
  };

  const content = getContent();
  const progress = ((['word', 'meaning', 'example', 'translation'].indexOf(state) + 1) / 4) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-4">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2 text-center">{content.label}</p>
      </div>

      <button
        onClick={handleClick}
        className={`
          w-full min-h-[400px] bg-gradient-to-br from-blue-500 to-purple-600 
          rounded-2xl shadow-2xl p-8 text-white transform transition-all duration-300
          hover:scale-105 active:scale-95
          ${isFlipping ? 'opacity-50 scale-95' : ''}
        `}
      >
        <div className="flex items-center justify-center h-full">
          <p className="text-3xl font-bold text-center leading-relaxed">
            {content.text}
          </p>
        </div>
      </button>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          카드를 클릭하여 다음 단계로 진행하세요
        </p>
      </div>
    </div>
  );
}

