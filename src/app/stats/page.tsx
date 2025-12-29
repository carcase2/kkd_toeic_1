'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { format } from 'date-fns';

interface StatsData {
  totalWords: number;
  studiedWords: number;
  todayStudied: number;
  wordsByDate: { date: string; count: number }[];
  recentStudy: { date: string; count: number }[];
  topWords: any[];
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Navigation />
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">통계를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Navigation />
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">통계를 불러올 수 없습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          학습 통계
        </h1>

        <Navigation />

        {/* 주요 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="text-4xl font-bold mb-2">{stats.totalWords}</div>
            <div className="text-blue-100">전체 단어 수</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="text-4xl font-bold mb-2">{stats.studiedWords}</div>
            <div className="text-purple-100">학습한 단어 수</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="text-4xl font-bold mb-2">{stats.todayStudied}</div>
            <div className="text-green-100">오늘 학습한 단어</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 최근 등록된 단어 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">최근 등록된 단어 (최근 30일)</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats.wordsByDate.length > 0 ? (
                stats.wordsByDate.map((item) => (
                  <div
                    key={item.date}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-gray-700">
                      {format(new Date(item.date), 'yyyy년 MM월 dd일')}
                    </span>
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {item.count}개
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">등록된 단어가 없습니다.</p>
              )}
            </div>
          </div>

          {/* 최근 학습 기록 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">최근 학습 기록 (최근 7일)</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats.recentStudy.length > 0 ? (
                stats.recentStudy.map((item) => (
                  <div
                    key={item.date}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-gray-700">
                      {format(new Date(item.date), 'yyyy년 MM월 dd일')}
                    </span>
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {item.count}회
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">학습 기록이 없습니다.</p>
              )}
            </div>
          </div>
        </div>

        {/* 가장 많이 학습한 단어 */}
        {stats.topWords.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">가장 많이 학습한 단어 Top 10</h2>
            <div className="space-y-3">
              {stats.topWords.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-bold text-lg text-gray-800">{item.word}</div>
                      <div className="text-sm text-gray-600">{item.meaning}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{item.study_count}</div>
                    <div className="text-xs text-gray-500">회 학습</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


