import { NextRequest, NextResponse } from 'next/server';
import { backendApi } from '@/lib/server/api';

/**
 * POST /api/kanban/tasks - 새 업무 생성
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

    const response = await backendApi.withAuth(token).post('/kanban/tasks', body);

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Create task error:', error);

    if (error.response) {
      return NextResponse.json(
        {
          message: error.response.data?.message || '업무 생성에 실패했습니다.',
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
 * PATCH /api/kanban/tasks - 업무 이동 (컬럼/위치 변경)
 */
export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { taskId, columnId, position } = body;

    const response = await backendApi.withAuth(token).patch(
      `/kanban/tasks/${taskId}/move`,
      { columnId, position }
    );

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Move task error:', error);

    if (error.response) {
      return NextResponse.json(
        {
          message: error.response.data?.message || '업무 이동에 실패했습니다.',
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
