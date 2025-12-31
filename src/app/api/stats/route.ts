import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: 통계 데이터 조회
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('user_id');

  try {
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // 전체 단어 수
    const { count: totalWords, error: totalError } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (totalError) throw totalError;

    // 학습한 단어 수
    const { data: studiedData, error: studiedError } = await supabase
      .from('study_records')
      .select('word_id')
      .eq('user_id', userId);

    if (studiedError) throw studiedError;
    const studiedWords = new Set(studiedData?.map(r => r.word_id) || []).size;

    // 오늘 날짜
    const today = new Date().toISOString().split('T')[0];

    // 오늘 학습한 단어 수
    const { data: todayData, error: todayError } = await supabase
      .from('study_records')
      .select('word_id')
      .eq('user_id', userId)
      .gte('studied_at', `${today}T00:00:00`)
      .lt('studied_at', `${today}T23:59:59`);

    if (todayError) throw todayError;
    const todayStudied = new Set(todayData?.map(r => r.word_id) || []).size;

    // 날짜별 단어 수 (공통 단어이지만 사용자별 학습 통계를 위해 조회)
    const { data: wordsData, error: wordsError } = await supabase
      .from('words')
      .select('date')
      .order('date', { ascending: false })
      .limit(1000);

    if (wordsError) throw wordsError;

    const wordsByDateMap = new Map<string, number>();
    wordsData?.forEach(word => {
      const count = wordsByDateMap.get(word.date) || 0;
      wordsByDateMap.set(word.date, count + 1);
    });

    const wordsByDate = Array.from(wordsByDateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30);

    // 최근 학습 기록 (최근 7일)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    const { data: recentData, error: recentError } = await supabase
      .from('study_records')
      .select('studied_at')
      .eq('user_id', userId)
      .gte('studied_at', `${sevenDaysAgoStr}T00:00:00`);

    if (recentError) throw recentError;

    const recentStudyMap = new Map<string, number>();
    recentData?.forEach(record => {
      const date = record.studied_at.split('T')[0];
      const count = recentStudyMap.get(date) || 0;
      recentStudyMap.set(date, count + 1);
    });

    const recentStudy = Array.from(recentStudyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date));

    // 가장 많이 학습한 단어 Top 10
    const studyCountMap = new Map<number, number>();
    studiedData?.forEach(record => {
      const count = studyCountMap.get(record.word_id) || 0;
      studyCountMap.set(record.word_id, count + 1);
    });

    // 공통 단어 조회 (사용자별 학습 횟수 통계를 위해)
    const { data: allWords, error: allWordsError } = await supabase
      .from('words')
      .select('*');

    if (allWordsError) throw allWordsError;

    const topWords = allWords
      ?.map(word => ({
        ...word,
        study_count: studyCountMap.get(word.id) || 0,
      }))
      .sort((a, b) => {
        if (b.study_count !== a.study_count) {
          return b.study_count - a.study_count;
        }
        return b.date.localeCompare(a.date);
      })
      .slice(0, 10) || [];

    return NextResponse.json({
      totalWords: totalWords || 0,
      studiedWords,
      todayStudied,
      wordsByDate,
      recentStudy,
      topWords,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

