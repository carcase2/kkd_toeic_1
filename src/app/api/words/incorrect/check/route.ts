import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: 특정 단어가 현재 사용자의 오답인지 확인
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('user_id');
  const wordId = searchParams.get('word_id');

  try {
    if (!userId || !wordId) {
      return NextResponse.json(
        { error: 'User ID and word ID are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('incorrect_words')
      .select('id')
      .eq('user_id', userId)
      .eq('word_id', wordId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking incorrect word:', error);
      return NextResponse.json(
        { error: 'Failed to check incorrect word' },
        { status: 500 }
      );
    }

    return NextResponse.json({ is_incorrect: !!data });
  } catch (error) {
    console.error('Error checking incorrect word:', error);
    return NextResponse.json(
      { error: 'Failed to check incorrect word' },
      { status: 500 }
    );
  }
}

