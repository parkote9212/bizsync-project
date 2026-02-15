import { NextRequest, NextResponse } from 'next/server';
import { backendApi } from '@/lib/server/api';

/**
 * GET /api/kanban/[projectId] - 프로젝트 칸반 보드 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { projectId } = await params;

    // 백엔드 칸반 보드 API 호출
    const response = await backendApi.withAuth(token).get(`/projects/${projectId}/board`);

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Get kanban board error:', error);

    if (error.response) {
      return NextResponse.json(
        {
          message: error.response.data?.message || '칸반 보드 조회에 실패했습니다.',
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
