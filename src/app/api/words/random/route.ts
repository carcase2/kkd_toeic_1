import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Word } from '@/types';

// GET: 랜덤 단어 10개 조회 (공통 단어)
export async function GET(request: NextRequest) {
  try {
    // 먼저 전체 단어 수를 가져온 후 랜덤하게 선택
    const { data: allWords, error: fetchError } = await supabase
      .from('words')
      .select('*');

    if (fetchError) {
      console.error('Error fetching words:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch random words' },
        { status: 500 }
      );
    }

    // 랜덤하게 섞고 10개 선택
    const shuffled = (allWords || []).sort(() => Math.random() - 0.5);
    const words = shuffled.slice(0, 10);

    return NextResponse.json(words);
  } catch (error) {
    console.error('Error fetching random words:', error);
    return NextResponse.json(
      { error: 'Failed to fetch random words' },
      { status: 500 }
    );
  }
}

