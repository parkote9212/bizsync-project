import { NextRequest, NextResponse } from 'next/server';
import { backendApi } from '@/lib/server/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 백엔드 로그인 API 호출
    const response = await backendApi.post('/auth/login', {
      email,
      password,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Login error:', error);

    // 백엔드 에러 응답 전달
    if (error.response) {
      return NextResponse.json(
        {
          message: error.response.data?.message || '로그인에 실패했습니다.',
          code: error.response.data?.code,
        },
        { status: error.response.status }
      );
    }

    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
