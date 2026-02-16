import { NextRequest, NextResponse } from 'next/server';
import { backendApi } from '@/lib/server/api';

/** PATCH /api/projects/[id]/reopen - 완료/보류 → 재진행 */
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = _request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });
    }
    const { id } = await params;
    await backendApi.withAuth(token).patch(`/projects/${id}/reopen`);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    if (error.response) {
      return NextResponse.json(
        { message: error.response.data?.message || '재진행 처리에 실패했습니다.' },
        { status: error.response.status }
      );
    }
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
