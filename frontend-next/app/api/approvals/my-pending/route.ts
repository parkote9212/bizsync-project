import { NextRequest, NextResponse } from 'next/server';
import { backendApi } from '@/lib/server/api';

/**
 * GET /api/approvals/my-pending - 대기 중인 결재 목록
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
    const size = searchParams.get('size') || '20';
    const page = searchParams.get('page') || '0';

    const response = await backendApi
      .withAuth(token)
      .get('/approvals/my-pending', { params: { size, page } });

    const content = response?.data?.content ?? response?.content ?? [];
    return NextResponse.json({ content }, { status: 200 });
  } catch (error: any) {
    console.error('Get my-pending approvals error:', error);
    if (error.response) {
      return NextResponse.json(
        {
          message: error.response.data?.message || '대기 결재 목록 조회에 실패했습니다.',
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
