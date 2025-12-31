import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: 아이디 중복 체크
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

    // kks_users 테이블에서 아이디 확인
    const { data, error } = await supabase
      .from('kks_users')
      .select('id')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116은 "no rows returned" 에러
      console.error('Error checking user:', error);
      return NextResponse.json(
        { error: 'Failed to check user' },
        { status: 500 }
      );
    }

    // 아이디가 이미 존재하면 true, 없으면 false
    return NextResponse.json({ exists: !!data });
  } catch (error) {
    console.error('Error checking user:', error);
    return NextResponse.json(
      { error: 'Failed to check user' },
      { status: 500 }
    );
  }
}

// POST: 새 사용자 등록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, password } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // 먼저 중복 체크
    const { data: existingUser } = await supabase
      .from('kks_users')
      .select('id')
      .eq('id', user_id)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 존재하는 아이디입니다.' },
        { status: 409 }
      );
    }

    // 새 사용자 등록 (비밀번호는 선택사항)
    const userData: { id: string; password?: string } = { id: user_id };
    if (password) {
      userData.password = password; // 실제로는 해시화해야 하지만 간단하게 저장
    }

    const { data, error } = await supabase
      .from('kks_users')
      .insert(userData)
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, user: data });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PUT: 로그인 (비밀번호 확인)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, password } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // 사용자 조회
    const { data: user, error } = await supabase
      .from('kks_users')
      .select('id, password')
      .eq('id', user_id)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 비밀번호 확인
    if (user.password) {
      if (!password || user.password !== password) {
        return NextResponse.json(
          { error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json({ success: true, user: { id: user.id } });
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}

