'use client';

import { useState, useEffect, useRef } from 'react';
import { Word } from '@/types';

interface StudyCardProps {
  word: Word;
  onNext: () => void;
  onStudy: () => void;
  autoPlay?: boolean;
  isPaused?: boolean;
  onStart?: () => void;
  wordDelay?: number; // 단어 표시 후 뜻까지 시간 (초)
  sentenceDelay?: number; // 문장 표시 후 번역까지 시간 (초)
}

export default function StudyCard({ word, onNext, onStudy, autoPlay = false, isPaused = false, onStart, wordDelay = 1, sentenceDelay = 3 }: StudyCardProps) {
  const [showWord, setShowWord] = useState(true);
  const [showWordPronunciation, setShowWordPronunciation] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);
  const [showSentence, setShowSentence] = useState(false);
  const [showSentencePronunciation, setShowSentencePronunciation] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isIncorrect, setIsIncorrect] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const voicesLoadedRef = useRef(false);
  const pendingSpeechRef = useRef<{ text: string; lang: string } | null>(null);
  const userInteractionRef = useRef(false);

  // iOS Safari 감지
  const isIOSSafari = (): boolean => {
    if (typeof window === 'undefined') return false;
    const ua = window.navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua);
    const webkit = /WebKit/.test(ua);
    return iOS && webkit && !(window as any).MSStream;
  };

  // iOS Safari 호환: 음성 목록 로드 대기
  const ensureVoicesLoaded = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve([]);
        return;
      }

      const voices = window.speechSynthesis.getVoices();
      
      // iOS Safari: 음성이 이미 로드되어 있으면 반환
      if (voices.length > 0 && voicesLoadedRef.current) {
        resolve(voices);
        return;
      }

      // 음성이 없으면 로드 대기
      if (voices.length === 0) {
        const onVoicesChanged = () => {
          const loadedVoices = window.speechSynthesis.getVoices();
          if (loadedVoices.length > 0) {
            voicesLoadedRef.current = true;
            window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
            resolve(loadedVoices);
          }
        };
        
        window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
        
        // 타임아웃 설정 (최대 2초 대기)
        setTimeout(() => {
          window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
          const loadedVoices = window.speechSynthesis.getVoices();
          voicesLoadedRef.current = loadedVoices.length > 0;
          resolve(loadedVoices);
        }, 2000);
      } else {
        voicesLoadedRef.current = true;
        resolve(voices);
      }
    });
  };

  // 컴포넌트 마운트 시 음성 목록 로드 및 사용자 상호작용 감지
  useEffect(() => {
    if ('speechSynthesis' in window) {
      ensureVoicesLoaded();
    }

    // iOS Safari: 사용자 상호작용 감지
    const handleUserInteraction = () => {
      userInteractionRef.current = true;
      // 대기 중인 발음이 있으면 실행
      if (pendingSpeechRef.current) {
        const { text, lang } = pendingSpeechRef.current;
        pendingSpeechRef.current = null;
        // 직접 호출 (이미 사용자 상호작용 이벤트 핸들러 내)
        executeSpeak(text, lang);
      }
    };

    // 다양한 사용자 상호작용 이벤트 리스너 추가
    window.addEventListener('touchstart', handleUserInteraction, { once: true });
    window.addEventListener('click', handleUserInteraction, { once: true });
    window.addEventListener('touchend', handleUserInteraction, { once: true });

    return () => {
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchend', handleUserInteraction);
    };
  }, []);

  // 실제 TTS 실행 함수 (사용자 상호작용 이벤트 핸들러 내에서만 호출)
  const executeSpeak = async (text: string, lang: string = 'en-US') => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    try {
      // 기존 발음 취소
      window.speechSynthesis.cancel();
      
      // iOS Safari: 음성 목록이 로드될 때까지 대기
      const voices = await ensureVoicesLoaded();
      
      const getBestVoice = (targetLang: string) => {
        if (targetLang.startsWith('ko')) {
          // 한글 음성 우선순위: Google > Microsoft > Yuna > 기타 한국어 음성
          const preferredNames = ['Google', 'Microsoft', 'Yuna', 'Yunjin'];
          
          for (const name of preferredNames) {
            const voice = voices.find(v => 
              v.lang.startsWith('ko') && 
              (v.name.includes(name) || v.name.toLowerCase().includes(name.toLowerCase()))
            );
            if (voice) return voice;
          }
          
          // 한국어 음성 중 가장 자연스러운 것 선택
          return voices.find(v => v.lang.startsWith('ko-KR')) || 
                 voices.find(v => v.lang.startsWith('ko')) || 
                 null;
        } else {
          // 영어 음성 우선순위
          const preferredNames = ['Google', 'Microsoft', 'Samantha', 'Alex', 'Daniel', 'Karen', 'Victoria'];
          
          for (const name of preferredNames) {
            const voice = voices.find(v => v.lang.startsWith('en') && v.name.includes(name));
            if (voice) return voice;
          }
          
          return voices.find(v => v.lang.startsWith('en-US')) || 
                 voices.find(v => v.lang.startsWith('en')) || 
                 null;
        }
      };
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      
      // 언어별 설정 조정
      if (lang.startsWith('ko')) {
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
      } else {
        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
      }
      
      const selectedVoice = getBestVoice(lang);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        window.speechSynthesis.cancel();
      };
      
      // iOS Safari: speak 호출 (사용자 상호작용 이벤트 핸들러 내에서 호출됨)
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error in executeSpeak:', error);
      setIsSpeaking(false);
    }
  };

  // TTS 함수 (iOS Safari 호환 - 사용자 상호작용 확인)
  const speakText = (text: string, lang: string = 'en-US') => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // iOS Safari이고 사용자 상호작용이 없으면 대기
    if (isIOSSafari() && !userInteractionRef.current) {
      pendingSpeechRef.current = { text, lang };
      return;
    }

    // 사용자 상호작용이 있거나 iOS가 아니면 바로 실행
    executeSpeak(text, lang);
  };

  // 자동 진행
  useEffect(() => {
    if (!autoPlay || isPaused) {
      // 자동 재생이 꺼져있거나 일시정지 상태면 타임아웃 정리
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // 기존 타임아웃 정리
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (showWord && !showWordPronunciation) {
      // 단어 표시 후 발음 (wordDelay + 1초 추가)
      timeoutRef.current = setTimeout(() => {
        setShowWordPronunciation(true);
        // 사용자 상호작용이 이미 있었으면 iOS에서도 자동 발음 가능
        setTimeout(() => {
          speakText(word.word, 'en-US');
        }, 100);
      }, (wordDelay + 1) * 1000);
    } else if (showWordPronunciation && !showMeaning) {
      // 발음 후 해석 표시 (발음이 끝난 후 1초 추가)
      timeoutRef.current = setTimeout(() => {
        setShowMeaning(true);
      }, 2000);
    } else if (showMeaning && !showSentence) {
      // 해석 후 문장 표시
      timeoutRef.current = setTimeout(() => {
        setShowSentence(true);
      }, 500);
    } else if (showSentence && !showSentencePronunciation) {
      // 문장 표시 후 발음 (2초 추가)
      timeoutRef.current = setTimeout(() => {
        setShowSentencePronunciation(true);
        // 사용자 상호작용이 이미 있었으면 iOS에서도 자동 발음 가능
        setTimeout(() => {
          speakText(word.example, 'en-US');
        }, 100);
      }, 2500);
    } else if (showSentencePronunciation && !showTranslation) {
      // 발음 후 번역 표시 (sentenceDelay + 1초 추가)
      timeoutRef.current = setTimeout(() => {
        setShowTranslation(true);
      }, (sentenceDelay + 1) * 1000);
    } else if (showTranslation) {
      // 번역 표시 후 다음 단어로
      timeoutRef.current = setTimeout(() => {
        const userId = localStorage.getItem('userId');
        if (userId) {
          fetch('/api/study', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word_id: word.id, user_id: userId }),
          });
        }
        onStudy();
        onNext();
        window.speechSynthesis.cancel();
      }, 2000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [autoPlay, isPaused, showWord, showWordPronunciation, showMeaning, showSentence, showSentencePronunciation, showTranslation, wordDelay, sentenceDelay, word.id, word.word, word.example, onNext, onStudy]);

  // 단어 변경 시 상태 초기화 및 오답 여부 확인
  useEffect(() => {
    setShowWord(true);
    setShowWordPronunciation(false);
    setShowMeaning(false);
    setShowSentence(false);
    setShowSentencePronunciation(false);
    setShowTranslation(false);
    setIsSpeaking(false);
    
    // 현재 사용자의 오답 여부 확인
    const checkIncorrect = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setIsIncorrect(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/words/incorrect/check?user_id=${userId}&word_id=${word.id}`);
        const data = await response.json();
        setIsIncorrect(data.is_incorrect || false);
      } catch (error) {
        console.error('Error checking incorrect status:', error);
        setIsIncorrect(false);
      }
    };
    
    checkIncorrect();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    window.speechSynthesis.cancel();
  }, [word.id]);

  // 오답 체크박스 토글
  const handleIncorrectToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    const newValue = !isIncorrect;
    setIsIncorrect(newValue);

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setIsIncorrect(!newValue);
        alert('로그인이 필요합니다.');
        return;
      }
      
      const response = await fetch('/api/words/incorrect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word_id: word.id, is_incorrect: newValue, user_id: userId }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        // 실패 시 원래 상태로 복구
        setIsIncorrect(!newValue);
        console.error('Failed to update incorrect status:', result);
        alert(`오답 저장 실패: ${result.error || '알 수 없는 오류'}`);
      } else {
        // 성공 시 확인 메시지 (선택적)
        console.log('Incorrect status updated:', result);
      }
    } catch (error) {
      // 실패 시 원래 상태로 복구
      setIsIncorrect(!newValue);
      console.error('Error updating incorrect status:', error);
      alert('오답 저장 중 오류가 발생했습니다.');
    }
  };

  const handleClick = () => {
    // iOS Safari: 사용자 상호작용 플래그 설정
    userInteractionRef.current = true;
    
    // 대기 중인 발음이 있으면 실행
    if (pendingSpeechRef.current) {
      const { text, lang } = pendingSpeechRef.current;
      pendingSpeechRef.current = null;
      executeSpeak(text, lang);
      return;
    }

    // 일시정지 상태이고 자동 재생이 켜져있으면 시작
    if (isPaused && autoPlay && onStart) {
      onStart();
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // iOS Safari + 자동 재생 모드: 발음 단계에서만 발음 실행
    if (isIOSSafari() && autoPlay) {
      if (showWordPronunciation && !showMeaning && !isSpeaking) {
        // 단어 발음 단계: 발음 실행
        executeSpeak(word.word, 'en-US');
        return;
      } else if (showSentencePronunciation && !showTranslation && !isSpeaking) {
        // 문장 발음 단계: 발음 실행
        executeSpeak(word.example, 'en-US');
        return;
      }
      // 다른 단계는 자동 진행되므로 아무것도 하지 않음
      return;
    }

    // 수동 모드 또는 iOS가 아닌 경우: 기존 로직
    if (showWord && !showWordPronunciation) {
      setShowWordPronunciation(true);
      executeSpeak(word.word, 'en-US');
    } else if (showWordPronunciation && !showMeaning) {
      setShowMeaning(true);
    } else if (showMeaning && !showSentence) {
      setShowSentence(true);
    } else if (showSentence && !showSentencePronunciation) {
      setShowSentencePronunciation(true);
      executeSpeak(word.example, 'en-US');
    } else if (showSentencePronunciation && !showTranslation) {
      setShowTranslation(true);
    } else {
      const userId = localStorage.getItem('userId');
      if (userId) {
        fetch('/api/study', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ word_id: word.id, user_id: userId }),
        });
      }
      onStudy();
      onNext();
      setShowWord(true);
      setShowWordPronunciation(false);
      setShowMeaning(false);
      setShowSentence(false);
      setShowSentencePronunciation(false);
      setShowTranslation(false);
      window.speechSynthesis.cancel();
    }
  };

  const progress = ((showWord ? 1 : 0) + (showWordPronunciation ? 1 : 0) + (showMeaning ? 1 : 0) + (showSentence ? 1 : 0) + (showSentencePronunciation ? 1 : 0) + (showTranslation ? 1 : 0)) * (100 / 6);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-4">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2 text-center">
          {!showWordPronunciation ? '단어' : !showMeaning ? '발음' : !showSentence ? '뜻' : !showSentencePronunciation ? '예시 문장' : !showTranslation ? '발음' : '번역'}
        </p>
      </div>

      <button
        onClick={handleClick}
        className="w-full min-h-[300px] sm:min-h-[400px] bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl p-6 sm:p-8 text-white relative transition-all duration-300 hover:shadow-3xl hover:scale-[1.01]"
      >
        {/* 오답 체크박스 */}
        <div 
          className="absolute top-4 right-4 z-10"
          onClick={handleIncorrectToggle}
        >
          <label className="flex items-center gap-2 cursor-pointer bg-white/20 hover:bg-white/30 rounded-lg px-3 py-2 transition-colors">
            <input
              type="checkbox"
              checked={isIncorrect}
              onChange={() => {}} // handleIncorrectToggle에서 처리
              className="w-5 h-5 rounded border-2 border-white/50 checked:bg-red-500 checked:border-red-500 focus:ring-2 focus:ring-white/50 cursor-pointer"
            />
            <span className="text-sm font-semibold">오답</span>
          </label>
        </div>

        <div className="flex flex-col items-center justify-center h-full space-y-4">
          {/* 단어 - 항상 표시 */}
          {showWord && (
            <p className="text-3xl sm:text-4xl font-bold text-center leading-relaxed">
              {word.word}
            </p>
          )}

          {/* 단어 발음 중 */}
          {showWordPronunciation && (
            <div className="w-full animate-fadeIn">
              {isSpeaking && (
                <div className="flex items-center justify-center gap-2 text-white/80">
                  <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4-3.617a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">발음 중...</span>
                </div>
              )}
            </div>
          )}

          {/* 뜻 - 표시 */}
          {showMeaning && (
            <div className="w-full animate-fadeIn">
              <div className="w-16 h-1 bg-white/30 rounded-full mx-auto mb-3"></div>
              <p className="text-xl sm:text-2xl text-center leading-relaxed">
                {word.meaning}
              </p>
            </div>
          )}

          {/* 예시 문장 - 표시 */}
          {showSentence && (
            <div className="w-full animate-fadeIn mt-4">
              <div className="w-16 h-1 bg-white/30 rounded-full mx-auto mb-3"></div>
              <p className="text-base sm:text-xl font-semibold text-center leading-relaxed">
                {word.example}
              </p>
            </div>
          )}

          {/* 문장 발음 중 */}
          {showSentencePronunciation && (
            <div className="w-full animate-fadeIn">
              {isSpeaking && (
                <div className="flex items-center justify-center gap-2 text-white/80">
                  <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4-3.617a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">발음 중...</span>
                </div>
              )}
            </div>
          )}

          {/* 번역 - 표시 */}
          {showTranslation && (
            <div className="w-full animate-fadeIn mt-4">
              <div className="w-16 h-1 bg-white/30 rounded-full mx-auto mb-3"></div>
              <p className="text-sm sm:text-lg text-center leading-relaxed opacity-90">
                {word.example_meaning}
              </p>
            </div>
          )}
        </div>
      </button>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          {isPaused && autoPlay ? '화면을 클릭하여 시작하세요' : autoPlay ? '자동 재생 중...' : '카드를 클릭하여 다음 단계로 진행하세요'}
        </p>
      </div>
    </div>
  );
}
