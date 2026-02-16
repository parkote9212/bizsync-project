import { NextRequest, NextResponse } from 'next/server';
import { backendApi } from '@/lib/server/api';

/** GET /api/projects/[id] - 프로젝트 단건 조회 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = _request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });
    }
    const { id } = await params;
    const response = await backendApi.withAuth(token).get(`/projects/${id}`);
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    if (error.response) {
      return NextResponse.json(
        { message: error.response.data?.message || '프로젝트 조회에 실패했습니다.' },
        { status: error.response.status }
      );
    }
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
