'use client';

import { useState, useEffect, useRef } from 'react';
import { Word } from '@/types';
import { format } from 'date-fns';

interface WordSearchProps {
  onWordSelect?: (word: Word) => void;
}

export default function WordSearch({ onWordSelect }: WordSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Word[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 디바운싱: 입력이 멈춘 후 300ms 후에 검색
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    if (searchQuery.trim().length < 2) {
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/words/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        setSearchResults(data);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching words:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleWordClick = (word: Word) => {
    if (onWordSelect) {
      onWordSelect(word);
    }
    setSearchQuery('');
    setShowResults(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (searchResults.length > 0) {
              setShowResults(true);
            }
          }}
          placeholder="단어, 뜻, 예시 문장으로 검색..."
          className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {isSearching && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {showResults && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs text-gray-500 mb-2 px-2">
              검색 결과: {searchResults.length}개
            </div>
            {searchResults.map((word) => (
              <button
                key={word.id}
                onClick={() => handleWordClick(word)}
                className="w-full text-left p-3 hover:bg-blue-50 rounded-lg transition-colors mb-1"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-blue-600 text-lg">{word.word}</span>
                      <span className="text-sm text-gray-600">({word.meaning})</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{word.example}</p>
                    <p className="text-xs text-gray-500">{word.example_meaning}</p>
                  </div>
                  <div className="text-xs text-gray-400 ml-4">
                    {format(new Date(word.date), 'MM/dd')}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {showResults && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
          <p className="text-center text-gray-500">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

