import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { backendApi } from '@/lib/server/api';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const response = await backendApi.withAuth(accessToken).post(`/projects/${id}/invite`, body);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('팀원 초대 실패:', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.message || '팀원 초대 실패' },
      { status: error.response?.status || 500 }
    );
  }
}
