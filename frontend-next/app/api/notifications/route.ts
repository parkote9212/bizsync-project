import { NextRequest, NextResponse } from 'next/server';
import { backendApi } from '@/lib/server/api';

/**
 * GET /api/notifications - 알림 목록 조회
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
    const unread = searchParams.get('unread');
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '20';

    const queryParams: any = { page, size };
    if (unread === 'true') {
      queryParams.unread = true;
    }

    const response = await backendApi.withAuth(token).get('/notifications', {
      params: queryParams,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Get notifications error:', error);

    if (error.response) {
      return NextResponse.json(
        {
          message: error.response.data?.message || '알림 조회에 실패했습니다.',
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
