'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Calendar from '@/components/Calendar';
import WordForm from '@/components/WordForm';
import BulkWordForm from '@/components/BulkWordForm';
import WordList from '@/components/WordList';
import WordSearch from '@/components/WordSearch';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Word } from '@/types';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [words, setWords] = useState<Word[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | undefined>();

  useEffect(() => {
    fetchWords();
  }, [selectedDate]);

  const fetchWords = async () => {
    try {
      const response = await fetch(`/api/words?date=${selectedDate}`);
      const data = await response.json();
      setWords(data);
    } catch (error) {
      console.error('Error fetching words:', error);
    }
  };

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setEditingWord(undefined);
  };

  const handleAddWord = () => {
    setEditingWord(undefined);
    setShowForm(true);
  };

  const handleEditWord = (word: Word) => {
    setEditingWord(word);
    setShowForm(true);
  };

  const handleDeleteWord = () => {
    fetchWords();
  };

  const handleSaveWord = () => {
    fetchWords();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
            토익 단어 학습
          </h1>
          
          <Navigation />

        <div className="mb-6">
          <WordSearch onWordSelect={(word) => {
            // 검색된 단어의 날짜로 이동
            setSelectedDate(word.date);
            setEditingWord(undefined);
          }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Calendar
              onDateClick={handleDateClick}
              selectedDate={selectedDate}
            />
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {format(new Date(selectedDate), 'yyyy년 MM월 dd일')} 단어
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBulkForm(true)}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-600 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  일괄 등록
                </button>
                <button
                  onClick={handleAddWord}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  단어 추가
                </button>
              </div>
            </div>

            {words.length < 10 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  오늘 {10 - words.length}개의 단어를 더 추가하세요!
                </p>
              </div>
            )}

            <WordList
              words={words}
              onEdit={handleEditWord}
              onDelete={handleDeleteWord}
            />
          </div>
        </div>

        {showForm && (
          <WordForm
            date={selectedDate}
            word={editingWord}
            onSave={handleSaveWord}
            onClose={() => {
              setShowForm(false);
              setEditingWord(undefined);
            }}
          />
        )}

        {showBulkForm && (
          <BulkWordForm
            date={selectedDate}
            onSave={handleSaveWord}
            onClose={() => {
              setShowBulkForm(false);
            }}
          />
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}
