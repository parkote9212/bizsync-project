import { NextRequest, NextResponse } from 'next/server';
import { backendApi } from '@/lib/server/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 백엔드 로그인 API 호출
    const response = await backendApi.post<{
      success: boolean;
      data: {
        accessToken: string;
        refreshToken: string;
        userId: number;
        name: string;
        email: string;
        role: string;
        position?: string;
        department?: string;
      };
      message?: string;
    }>('/auth/login', {
      email,
      password,
    });

    // ApiResponse 형식에서 데이터 추출
    if (!response.success || !response.data) {
      return NextResponse.json(
        { message: response.message || '로그인에 실패했습니다.' },
        { status: 401 }
      );
    }

    // 응답에서 토큰 추출
    const { accessToken, refreshToken, ...userData } = response.data;

    // NextResponse 생성
    const res = NextResponse.json({ success: true, user: userData }, { status: 200 });

    // 쿠키 설정
    if (accessToken) {
      res.cookies.set('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60, // 1시간
        path: '/',
      });
    }

    if (refreshToken) {
      res.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7일
        path: '/',
      });
    }

    return res;
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
