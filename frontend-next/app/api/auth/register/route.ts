import { NextRequest, NextResponse } from 'next/server';
import { backendApi } from '@/lib/server/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 백엔드 회원가입 API 호출 (signup 엔드포인트)
    const response = await backendApi.post('/auth/signup', body);

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Register error:', error);

    if (error.response) {
      return NextResponse.json(
        {
          message: error.response.data?.message || '회원가입에 실패했습니다.',
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
