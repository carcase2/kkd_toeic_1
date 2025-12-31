'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from 'date-fns';
import { Word } from '@/types';

interface CalendarProps {
  onDateClick: (date: string) => void;
  selectedDate?: string;
}

export default function Calendar({ onDateClick, selectedDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [wordsByDate, setWordsByDate] = useState<Record<string, number>>({});
  const [studiedDates, setStudiedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchWordsByDate();
    fetchStudiedDates();
  }, [currentMonth]);

  const fetchWordsByDate = async () => {
    try {
      const response = await fetch('/api/words');
      const words: Word[] = await response.json();
      const countMap: Record<string, number> = {};
      words.forEach((word) => {
        countMap[word.date] = (countMap[word.date] || 0) + 1;
      });
      setWordsByDate(countMap);
    } catch (error) {
      console.error('Error fetching words:', error);
    }
  };

  const fetchStudiedDates = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      
      const response = await fetch(`/api/study/dates?user_id=${userId}`);
      const dates: string[] = await response.json();
      setStudiedDates(new Set(dates));
    } catch (error) {
      console.error('Error fetching studied dates:', error);
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    onDateClick(dateStr);
  };

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          {format(currentMonth, 'yyyy년 MM월')}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <div key={day} className="text-center font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {emptyDays.map((_, idx) => (
          <div key={`empty-${idx}`} />
        ))}
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const wordCount = wordsByDate[dateStr] || 0;
          const isSelected = selectedDate && isSameDay(day, new Date(selectedDate));
          const isCurrentDay = isToday(day);
          const isStudied = studiedDates.has(dateStr);

          return (
            <button
              key={dateStr}
              onClick={() => handleDateClick(day)}
              className={`
                relative p-3 rounded-lg transition-all hover:scale-105
                ${isSelected ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-50 hover:bg-blue-50'}
                ${isCurrentDay && !isSelected ? 'ring-2 ring-blue-300' : ''}
                ${isStudied && !isSelected ? 'bg-green-50 border-2 border-green-300' : ''}
              `}
            >
              <div className="text-sm font-medium">{format(day, 'd')}</div>
              {wordCount > 0 && (
                <div className={`
                  absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                  ${isSelected ? 'bg-white text-blue-500' : 'bg-blue-500 text-white'}
                `}>
                  {wordCount}
                </div>
              )}
              {isStudied && (
                <div className={`
                  absolute bottom-1 left-1 w-2 h-2 rounded-full
                  ${isSelected ? 'bg-white' : 'bg-green-500'}
                `} title="학습 완료" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

