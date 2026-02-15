import { NextRequest, NextResponse } from 'next/server';
import { backendApi } from '@/lib/server/api';

/**
 * GET /api/approvals/[id] - 결재 문서 상세 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const response = await backendApi.withAuth(token).get(`/approvals/${id}`);

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Get approval detail error:', error);

    if (error.response) {
      return NextResponse.json(
        {
          message: error.response.data?.message || '결재 상세 조회에 실패했습니다.',
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
