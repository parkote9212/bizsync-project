import { NextRequest, NextResponse } from 'next/server';
import { backendApi } from '@/lib/server/api';

/**
 * GET /api/projects - 내 프로젝트 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    // Authorization 헤더에서 토큰 추출
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 백엔드 API 호출 (인증 토큰 포함)
    const response = await backendApi.withAuth(token).get('/projects/my');

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Get projects error:', error);

    if (error.response) {
      return NextResponse.json(
        {
          message: error.response.data?.message || '프로젝트 목록 조회에 실패했습니다.',
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
 * POST /api/projects - 새 프로젝트 생성
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

    const response = await backendApi.withAuth(token).post('/projects', body);

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('Create project error:', error);

    if (error.response) {
      return NextResponse.json(
        {
          message: error.response.data?.message || '프로젝트 생성에 실패했습니다.',
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
