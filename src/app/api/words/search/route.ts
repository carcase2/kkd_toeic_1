import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: 단어 검색 (공통 단어)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  try {
    if (!query || query.trim().length === 0) {
      return NextResponse.json([]);
    }

    const searchTerm = query.trim().toLowerCase();

    // 단어, 뜻, 예시 문장에서 검색
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .or(`word.ilike.%${searchTerm}%,meaning.ilike.%${searchTerm}%,example.ilike.%${searchTerm}%`)
      .order('date', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error searching words:', error);
      return NextResponse.json(
        { error: 'Failed to search words' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error searching words:', error);
    return NextResponse.json(
      { error: 'Failed to search words' },
      { status: 500 }
    );
  }
}

