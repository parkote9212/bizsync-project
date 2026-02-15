import { NextRequest, NextResponse } from 'next/server';
import { backendApi } from '@/lib/server/api';

/**
 * POST /api/approvals/[id]/approve - 결재 승인
 */
export async function POST(
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
    const body = await request.json();

    const response = await backendApi.withAuth(token).post(
      `/approvals/${id}/approve`,
      body
    );

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Approve error:', error);

    if (error.response) {
      return NextResponse.json(
        {
          message: error.response.data?.message || '결재 승인에 실패했습니다.',
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
