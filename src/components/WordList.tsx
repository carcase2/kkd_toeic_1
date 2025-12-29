'use client';

import { Word } from '@/types';

interface WordListProps {
  words: Word[];
  onEdit: (word: Word) => void;
  onDelete: (id: number) => void;
}

export default function WordList({ words, onEdit, onDelete }: WordListProps) {
  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/words?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDelete(id);
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error deleting word:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  if (words.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        등록된 단어가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {words.map((word) => (
        <div
          key={word.id}
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-blue-600">{word.word}</h3>
                <span className="text-sm text-gray-500">({word.meaning})</span>
              </div>
              <p className="text-gray-700 mb-1">{word.example}</p>
              <p className="text-sm text-gray-500">{word.example_meaning}</p>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => onEdit(word)}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                title="수정"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(word.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="삭제"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


