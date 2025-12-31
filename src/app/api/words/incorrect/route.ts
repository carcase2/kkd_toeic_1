import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: 오답 단어 조회 (사용자별)
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

    // incorrect_words 테이블에서 사용자의 오답 단어 ID 조회
    const { data: incorrectRecords, error: incorrectError } = await supabase
      .from('incorrect_words')
      .select('word_id')
      .eq('user_id', userId);

    if (incorrectError) {
      console.error('Error fetching incorrect words:', incorrectError);
      return NextResponse.json(
        { error: 'Failed to fetch incorrect words' },
        { status: 500 }
      );
    }

    if (!incorrectRecords || incorrectRecords.length === 0) {
      return NextResponse.json([]);
    }

    // word_id 목록 추출
    const wordIds = incorrectRecords.map(record => record.word_id);

    // words 테이블에서 해당 단어들 조회
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('*')
      .in('id', wordIds)
      .order('id', { ascending: true });

    if (wordsError) {
      console.error('Error fetching words:', wordsError);
      return NextResponse.json(
        { error: 'Failed to fetch words' },
        { status: 500 }
      );
    }

    return NextResponse.json(words || []);
  } catch (error) {
    console.error('Error fetching incorrect words:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incorrect words' },
      { status: 500 }
    );
  }
}

// POST: 오답 설정/해제 (사용자별)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { word_id, is_incorrect, user_id } = body;

    if (word_id === undefined || is_incorrect === undefined || !user_id) {
      return NextResponse.json(
        { error: 'word_id, is_incorrect, and user_id are required' },
        { status: 400 }
      );
    }

    if (is_incorrect) {
      // 오답으로 추가
      const { error } = await supabase
        .from('incorrect_words')
        .insert({ user_id, word_id })
        .select()
        .single();

      if (error) {
        // 이미 존재하는 경우 무시 (UNIQUE 제약조건)
        if (error.code !== '23505') {
          console.error('Error adding incorrect word:', error);
          return NextResponse.json(
            { error: 'Failed to add incorrect word' },
            { status: 500 }
          );
        }
      }
    } else {
      // 오답에서 제거
      const { error } = await supabase
        .from('incorrect_words')
        .delete()
        .eq('user_id', user_id)
        .eq('word_id', word_id);

      if (error) {
        console.error('Error removing incorrect word:', error);
        return NextResponse.json(
          { error: 'Failed to remove incorrect word' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating incorrect status:', error);
    return NextResponse.json(
      { error: 'Failed to update incorrect status' },
      { status: 500 }
    );
  }
}

