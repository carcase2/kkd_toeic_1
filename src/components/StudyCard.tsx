'use client';

import { useState, useEffect } from 'react';
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
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 컴포넌트 마운트 시 음성 목록 로드
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // 음성 목록 강제 로드
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // TTS (Text-to-Speech) 함수 - 토익 시험 스타일
  const speakText = (text: string, lang: string = 'en-US') => {
    if ('speechSynthesis' in window) {
      // 이전 발음 중지
      window.speechSynthesis.cancel();
      
      const getBestVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        
        // 우선순위: Google > Microsoft > Samantha > Alex > Daniel > 기타 영어 음성
        const preferredNames = ['Google', 'Microsoft', 'Samantha', 'Alex', 'Daniel', 'Karen', 'Victoria'];
        
        for (const name of preferredNames) {
          const voice = voices.find(v => 
            v.lang.startsWith('en') && 
            v.name.includes(name)
          );
          if (voice) return voice;
        }
        
        // 미국 영어 우선
        return voices.find(v => v.lang.startsWith('en-US')) || 
               voices.find(v => v.lang.startsWith('en')) || 
               null;
      };
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      
      // 토익 시험 스타일 설정
      utterance.rate = 0.8; // 토익 시험 속도 (조금 느리게)
      utterance.pitch = 1.0; // 자연스러운 높이
      utterance.volume = 1.0; // 최대 볼륨
      
      // 음성 선택
      const selectedVoice = getBestVoice();
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        window.speechSynthesis.cancel();
      };
      utterance.onerror = (e) => {
        console.error('TTS Error:', e);
        setIsSpeaking(false);
        window.speechSynthesis.cancel();
      };
      
      // 음성 목록이 준비되지 않았을 경우 대비
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          const voice = getBestVoice();
          if (voice) {
            utterance.voice = voice;
          }
          window.speechSynthesis.speak(utterance);
        };
      } else {
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const handleClick = () => {
    setIsFlipping(true);
    setTimeout(() => {
      if (state === 'word') {
        setState('meaning');
        // 단어 발음
        setTimeout(() => speakText(word.word, 'en-US'), 200);
      } else if (state === 'meaning') {
        setState('example');
      } else if (state === 'example') {
        setState('translation');
        // 문장 발음
        setTimeout(() => speakText(word.example, 'en-US'), 200);
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
        // 발음 중지
        window.speechSynthesis.cancel();
      }
      setIsFlipping(false);
    }, 150);
  };

  const getContent = () => {
    switch (state) {
      case 'word':
        return { text: word.word, label: '단어', showMeaning: false };
      case 'meaning':
        return { text: word.meaning, label: '뜻', showMeaning: true, word: word.word };
      case 'example':
        return { text: word.example, label: '예시 문장', showMeaning: false };
      case 'translation':
        return { text: word.example_meaning, label: '번역', showMeaning: true, example: word.example };
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
          hover:scale-105 active:scale-95 relative
          ${isFlipping ? 'opacity-50 scale-95' : ''}
        `}
      >
        <div className="flex flex-col items-center justify-center h-full">
          {state === 'word' && (
            <p className="text-4xl font-bold text-center leading-relaxed">
              {content.text}
            </p>
          )}
          
          {state === 'meaning' && (
            <>
              <p className="text-4xl font-bold text-center mb-4">
                {content.word}
              </p>
              <div className="w-16 h-1 bg-white/30 rounded-full mb-4"></div>
              <p className="text-2xl text-center leading-relaxed">
                {content.text}
              </p>
              {isSpeaking && (
                <div className="mt-4 flex items-center gap-2 text-white/80">
                  <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4-3.617a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">발음 중...</span>
                </div>
              )}
            </>
          )}
          
          {state === 'example' && (
            <p className="text-2xl font-semibold text-center leading-relaxed">
              {content.text}
            </p>
          )}
          
          {state === 'translation' && (
            <>
              <p className="text-2xl font-semibold text-center mb-4">
                {content.example}
              </p>
              <div className="w-16 h-1 bg-white/30 rounded-full mb-4"></div>
              <p className="text-xl text-center leading-relaxed">
                {content.text}
              </p>
              {isSpeaking && (
                <div className="mt-4 flex items-center gap-2 text-white/80">
                  <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4-3.617a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">발음 중...</span>
                </div>
              )}
            </>
          )}
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

