import { NextRequest, NextResponse } from 'next/server';
import { backendApi } from '@/lib/server/api';

/**
 * GET /api/approvals - 결재 문서 목록 조회 (백엔드 GET /api/approvals 프록시)
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
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '20';

    const response = await backendApi.withAuth(token).get('/approvals', {
      params: { page, size, sort: 'createdAt,desc' },
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Get approvals error:', error);

    if (error.response) {
      return NextResponse.json(
        {
          message: error.response.data?.message || '결재 목록 조회에 실패했습니다.',
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

/**
 * POST /api/approvals - 새 결재 문서 작성
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await backendApi.withAuth(token).post('/approvals', body);

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Create approval error:', error);

    if (error.response) {
      return NextResponse.json(
        {
          message: error.response.data?.message || '결재 작성에 실패했습니다.',
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
