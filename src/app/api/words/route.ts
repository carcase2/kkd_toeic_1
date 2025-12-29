import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Word } from '@/types';

// GET: 날짜별 단어 조회
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get('date');

  try {
    let query = supabase.from('words').select('*');

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query.order('id', { ascending: true });

    if (error) {
      console.error('Error fetching words:', error);
      return NextResponse.json(
        { error: 'Failed to fetch words' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching words:', error);
    return NextResponse.json(
      { error: 'Failed to fetch words' },
      { status: 500 }
    );
  }
}

// POST: 단어 추가
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, word, meaning, example, example_meaning } = body;

    if (!date || !word || !meaning || !example || !example_meaning) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('words')
      .insert({
        date,
        word,
        meaning,
        example,
        example_meaning,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        return NextResponse.json(
          { error: 'Word already exists for this date' },
          { status: 409 }
        );
      }
      console.error('Error creating word:', error);
      return NextResponse.json(
        { error: 'Failed to create word' },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data.id });
  } catch (error) {
    console.error('Error creating word:', error);
    return NextResponse.json(
      { error: 'Failed to create word' },
      { status: 500 }
    );
  }
}

// PUT: 단어 수정
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, word, meaning, example, example_meaning } = body;

    if (!id || !word || !meaning || !example || !example_meaning) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('words')
      .update({
        word,
        meaning,
        example,
        example_meaning,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating word:', error);
      return NextResponse.json(
        { error: 'Failed to update word' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating word:', error);
    return NextResponse.json(
      { error: 'Failed to update word' },
      { status: 500 }
    );
  }
}

// DELETE: 단어 삭제
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  try {
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('words')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting word:', error);
      return NextResponse.json(
        { error: 'Failed to delete word' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting word:', error);
    return NextResponse.json(
      { error: 'Failed to delete word' },
      { status: 500 }
    );
  }
}

