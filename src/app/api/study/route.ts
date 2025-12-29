import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST: 학습 기록 추가
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { word_id } = body;

    if (!word_id) {
      return NextResponse.json({ error: 'word_id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('study_records')
      .insert({ word_id });

    if (error) {
      console.error('Error recording study:', error);
      return NextResponse.json(
        { error: 'Failed to record study' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording study:', error);
    return NextResponse.json(
      { error: 'Failed to record study' },
      { status: 500 }
    );
  }
}

