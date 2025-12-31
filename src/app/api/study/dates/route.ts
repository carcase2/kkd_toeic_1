import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: 사용자가 학습한 날짜 목록 조회
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

    // 사용자가 학습한 단어들의 날짜 조회
    // 먼저 학습 기록에서 word_id 목록 가져오기
    const { data: studyRecords, error: studyError } = await supabase
      .from('study_records')
      .select('word_id')
      .eq('user_id', userId);

    if (studyError) {
      console.error('Error fetching study records:', studyError);
      return NextResponse.json(
        { error: 'Failed to fetch study dates' },
        { status: 500 }
      );
    }

    if (!studyRecords || studyRecords.length === 0) {
      return NextResponse.json([]);
    }

    // word_id 목록 추출
    const wordIds = studyRecords.map(r => r.word_id);

    // words 테이블에서 해당 단어들의 날짜 조회
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('date')
      .in('id', wordIds);

    if (wordsError) {
      console.error('Error fetching words:', wordsError);
      return NextResponse.json(
        { error: 'Failed to fetch study dates' },
        { status: 500 }
      );
    }

    // 날짜별로 집계
    const datesSet = new Set<string>();
    words?.forEach((word: any) => {
      if (word.date) {
        datesSet.add(word.date);
      }
    });

    return NextResponse.json(Array.from(datesSet));
  } catch (error) {
    console.error('Error fetching study dates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch study dates' },
      { status: 500 }
    );
  }
}
