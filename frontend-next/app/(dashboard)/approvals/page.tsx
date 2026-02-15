'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api';
import type { ApprovalDocument, ApprovalStatus, ApprovalType } from '@/types';

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    loadApprovals();
  }, [filter]);

  const loadApprovals = async () => {
    try {
      // 추후 실제 API 연동
      // const response = await apiClient.get('/approvals', {
      //   params: { status: filter !== 'all' ? filter : undefined },
      // });
      // setApprovals(response.data.content);

      // 임시 데이터
      setTimeout(() => {
        const allApprovals: ApprovalDocument[] = [
          {
            documentId: 1,
            drafter: {
              userId: 1,
              email: 'hong@example.com',
              name: '홍길동',
              status: 'ACTIVE' as any,
              role: 'USER' as any,
              createdAt: '2025-01-01T00:00:00',
            },
            title: '서버 증설 비용 결재',
            type: 'EXPENSE' as ApprovalType,
            content: 'AWS EC2 인스턴스 추가 구매 요청',
            status: 'PENDING' as ApprovalStatus,
            projectId: 1,
            amount: 5000000,
            createdAt: '2025-02-15T10:00:00',
          },
          {
            documentId: 2,
            drafter: {
              userId: 2,
              email: 'kim@example.com',
              name: '김철수',
              status: 'ACTIVE' as any,
              role: 'USER' as any,
              createdAt: '2025-01-01T00:00:00',
            },
            title: '연차 신청',
            type: 'LEAVE' as ApprovalType,
            content: '2025년 2월 20일 ~ 2월 21일 연차 사용',
            status: 'APPROVED' as ApprovalStatus,
            createdAt: '2025-02-10T14:00:00',
          },
          {
            documentId: 3,
            drafter: {
              userId: 3,
              email: 'lee@example.com',
              name: '이영희',
              status: 'ACTIVE' as any,
              role: 'USER' as any,
              createdAt: '2025-01-01T00:00:00',
            },
            title: '신규 프로젝트 착수 보고',
            type: 'GENERAL' as ApprovalType,
            content: 'BizSync v2 프로젝트 착수 보고서',
            status: 'APPROVED' as ApprovalStatus,
            projectId: 1,
            createdAt: '2025-02-01T09:00:00',
          },
        ];

        const filtered = filter === 'all'
          ? allApprovals
          : allApprovals.filter((a) => a.status.toLowerCase() === filter);

        setApprovals(filtered);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('결재 목록 로딩 실패:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">전자결재</h1>
          <p className="mt-2 text-gray-600">결재 문서를 확인하고 승인하세요</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          + 새 결재 작성
        </button>
      </div>

      {/* 필터 탭 */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { key: 'all', label: '전체' },
            { key: 'pending', label: '대기' },
            { key: 'approved', label: '승인' },
            { key: 'rejected', label: '반려' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                filter === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 결재 목록 */}
      <div className="space-y-4">
        {approvals.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            결재 문서가 없습니다.
          </div>
        ) : (
          approvals.map((approval) => (
            <ApprovalCard key={approval.documentId} approval={approval} />
          ))
        )}
      </div>
    </div>
  );
}

function ApprovalCard({ approval }: { approval: ApprovalDocument }) {
  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    CANCELED: 'bg-gray-100 text-gray-700',
  };

  const statusLabels = {
    PENDING: '대기',
    APPROVED: '승인',
    REJECTED: '반려',
    CANCELED: '취소',
  };

  const typeLabels = {
    GENERAL: '일반',
    EXPENSE: '비용',
    LEAVE: '휴가',
  };

  const typeIcons = {
    GENERAL: '📄',
    EXPENSE: '💰',
    LEAVE: '🏖️',
  };

  return (
    <Link
      href={`/approvals/${approval.documentId}`}
      className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          <div className="text-2xl">{typeIcons[approval.type]}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {approval.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {approval.content}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-4 ${
            statusColors[approval.status]
          }`}
        >
          {statusLabels[approval.status]}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            👤 {approval.drafter.name}
          </span>
          <span className="flex items-center">
            📁 {typeLabels[approval.type]}
          </span>
          {approval.amount && (
            <span className="flex items-center font-medium text-gray-700">
              💰 {approval.amount.toLocaleString()}원
            </span>
          )}
        </div>
        <span className="text-xs">
          {new Date(approval.createdAt).toLocaleString()}
        </span>
      </div>
    </Link>
  );
}
