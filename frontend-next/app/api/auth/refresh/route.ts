import { NextRequest, NextResponse } from 'next/server';
import { backendApi } from '@/lib/server/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { message: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // 백엔드 토큰 갱신 API 호출
    const response = await backendApi.post('/auth/refresh', {
      refreshToken,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Token refresh error:', error);

    if (error.response) {
      return NextResponse.json(
        {
          message: error.response.data?.message || '토큰 갱신에 실패했습니다.',
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
