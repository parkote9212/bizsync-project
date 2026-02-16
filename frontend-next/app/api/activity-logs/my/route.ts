import { NextRequest, NextResponse } from 'next/server';
import { backendApi } from '@/lib/server/api';

/**
 * GET /api/activity-logs/my - 현재 사용자 최근 활동 로그 조회
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const size = searchParams.get('size') || '10';
    const page = searchParams.get('page') || '0';

    const response = await backendApi
      .withAuth(token)
      .get(`/activity-logs/my?size=${size}&page=${page}&sort=createdAt,desc`);

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Get my activity logs error:', error);
    if (error.response) {
      return NextResponse.json(
        {
          message: error.response.data?.message || '활동 로그 조회에 실패했습니다.',
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
