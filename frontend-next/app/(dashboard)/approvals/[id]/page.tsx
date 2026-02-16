'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/lib/api';
import type { ApprovalDocument, ApprovalStatus } from '@/types';

interface ApprovalLine {
  lineId: number;
  approverId: number;
  approverName: string;
  sequence: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comment?: string;
  approvedAt?: string;
}

export default function ApprovalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;

  const [approval, setApproval] = useState<ApprovalDocument | null>(null);
  const [approvalLines, setApprovalLines] = useState<ApprovalLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadApprovalDetail();
  }, [documentId]);

  const loadApprovalDetail = async () => {
    try {
      // 추후 실제 API 연동
      // const response = await apiClient.get(`/approvals/${documentId}`);
      // setApproval(response.data.document);
      // setApprovalLines(response.data.approvalLines);

      // 임시 데이터
      setTimeout(() => {
        setApproval({
          documentId: parseInt(documentId),
          drafter: {
            userId: 1,
            email: 'hong@example.com',
            name: '홍길동',
            department: '개발팀',
            position: '대리',
            status: 'ACTIVE' as any,
            role: 'USER' as any,
            createdAt: '2025-01-01T00:00:00',
          },
          title: '서버 증설 비용 결재',
          type: 'EXPENSE' as any,
          content: 'AWS EC2 인스턴스 추가 구매 요청\n\n현재 사용자 증가로 인해 서버 성능이 저하되고 있어 t3.large 인스턴스 2대를 추가로 구매하고자 합니다.',
          status: 'PENDING' as ApprovalStatus,
          projectId: 1,
          amount: 5000000,
          createdAt: '2025-02-15T10:00:00',
        });

        setApprovalLines([
          {
            lineId: 1,
            approverId: 2,
            approverName: '김팀장',
            sequence: 1,
            status: 'PENDING',
          },
          {
            lineId: 2,
            approverId: 3,
            approverName: '박부장',
            sequence: 2,
            status: 'PENDING',
          },
        ]);

        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('결재 상세 로딩 실패:', error);
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (processing) return;
    setProcessing(true);

    try {
      // await apiClient.post(`/approvals/${documentId}/approve`, { comment });
      alert('결재가 승인되었습니다.');
      router.push('/approvals');
    } catch (error) {
      console.error('결재 승인 실패:', error);
      alert('결재 승인에 실패했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (processing) return;
    if (!comment.trim()) {
      alert('반려 사유를 입력해주세요.');
      return;
    }

    setProcessing(true);

    try {
      // await apiClient.post(`/approvals/${documentId}/reject`, { comment });
      alert('결재가 반려되었습니다.');
      router.push('/approvals');
    } catch (error) {
      console.error('결재 반려 실패:', error);
      alert('결재 반려에 실패했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!approval) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-gray-600 mb-4">결재 문서를 찾을 수 없습니다.</div>
        <button
          onClick={() => router.push('/approvals')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          목록으로
        </button>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800',
    APPROVED: 'bg-emerald-100 text-emerald-800',
    REJECTED: 'bg-red-100 text-red-800',
    CANCELED: 'bg-gray-100 text-gray-800',
  };

  const statusLabels = {
    PENDING: '대기',
    APPROVED: '승인',
    REJECTED: '반려',
    CANCELED: '취소',
  };

  const canApprove = approval.status === 'PENDING'; // 추후 권한 체크 추가

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push('/approvals')}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← 목록으로
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{approval.title}</h1>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              statusColors[approval.status] ?? 'bg-gray-100 text-gray-800'
            }`}
          >
            {statusLabels[approval.status] ?? approval.status}
          </span>
        </div>
      </div>

      {/* 문서 정보 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">기안자</p>
            <p className="font-medium">
              {approval.drafter.name} ({approval.drafter.position})
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">기안일</p>
            <p className="font-medium">
              {new Date(approval.createdAt).toLocaleString()}
            </p>
          </div>
          {approval.amount && (
            <div>
              <p className="text-sm text-gray-600 mb-1">금액</p>
              <p className="font-medium text-lg">
                {approval.amount.toLocaleString()}원
              </p>
            </div>
          )}
        </div>

        <div className="border-t pt-6">
          <p className="text-sm text-gray-600 mb-2">내용</p>
          <div className="whitespace-pre-wrap text-gray-900">
            {approval.content}
          </div>
        </div>
      </div>

      {/* 결재선 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">결재선</h2>
        <div className="flex items-center space-x-4">
          {approvalLines.map((line, index) => (
            <div key={line.lineId}>
              <div className="flex items-center">
                <div className="text-center">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
                      line.status === 'APPROVED'
                        ? 'bg-green-100'
                        : line.status === 'REJECTED'
                        ? 'bg-red-100'
                        : 'bg-gray-100'
                    }`}
                  >
                    {line.status === 'APPROVED'
                      ? '✅'
                      : line.status === 'REJECTED'
                      ? '❌'
                      : '⏳'}
                  </div>
                  <p className="text-sm font-medium text-gray-900 mt-2">
                    {line.approverName}
                  </p>
                  <p className="text-xs font-medium text-gray-700">
                    {line.status === 'APPROVED'
                      ? '승인'
                      : line.status === 'REJECTED'
                      ? '반려'
                      : '대기'}
                  </p>
                  {line.approvedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(line.approvedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {index < approvalLines.length - 1 && (
                  <div className="w-12 h-1 bg-gray-300 mx-2" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 결재 액션 */}
      {canApprove && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">결재 의견</h2>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            placeholder="의견을 입력하세요 (선택사항)"
          />

          <div className="flex justify-end space-x-3">
            <button
              onClick={handleReject}
              disabled={processing}
              className="px-6 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {processing ? '처리 중...' : '반려'}
            </button>
            <button
              onClick={handleApprove}
              disabled={processing}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {processing ? '처리 중...' : '승인'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
