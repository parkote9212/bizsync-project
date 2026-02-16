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
      let response;
      if (filter === 'pending') {
        response = await apiClient.get('/approvals/my-pending');
      } else {
        response = await apiClient.get('/approvals');
      }

      const raw = response.data?.data ?? response.data;
      let allApprovals = Array.isArray(raw?.content) ? raw.content : raw || [];

      // 필터 적용 (전체/대기 제외)
      if (filter !== 'all' && filter !== 'pending') {
        allApprovals = allApprovals.filter((a: ApprovalDocument) =>
          (a.status ?? '').toLowerCase() === filter
        );
      }

      setApprovals(allApprovals);
      setLoading(false);
    } catch (error) {
      console.error('결재 목록 로딩 실패:', error);
      setApprovals([]);
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
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">전자결재</h1>
          <p className="text-sm text-gray-500">결재 문서를 확인하고 승인하세요</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
          + 새 결재 작성
        </button>
      </div>

      {/* 필터 탭 */}
      <div className="mb-5 border-b border-gray-200">
        <nav className="flex gap-6">
          {[
            { key: 'all', label: '전체' },
            { key: 'pending', label: '대기' },
            { key: 'approved', label: '승인' },
            { key: 'rejected', label: '반려' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`pb-3 border-b-2 font-medium text-sm ${
                filter === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 결재 목록 */}
      <div className="space-y-3">
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
  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
    APPROVED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    REJECTED: 'bg-red-50 text-red-800 border-red-200',
    CANCELED: 'bg-gray-50 text-gray-800 border-gray-200',
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
      className="block bg-white border border-gray-200 hover:border-gray-300 p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="text-xl">{typeIcons[approval.type]}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {approval.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {approval.content}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex px-2 py-0.5 border text-xs font-semibold shrink-0 ml-4 text-gray-900 ${
            statusColors[approval.status] ?? 'bg-gray-100 text-gray-800 border-gray-200'
          }`}
        >
          {statusLabels[approval.status] ?? approval.status}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-4">
          <span className="flex items-center">
            👤 {approval.drafter.name}
          </span>
          <span className="flex items-center">
            📁 {typeLabels[approval.type]}
          </span>
          {approval.amount && (
            <span className="flex items-center font-medium text-gray-700 tabular-nums">
              💰 {approval.amount.toLocaleString()}원
            </span>
          )}
        </div>
        <span className="tabular-nums">
          {new Date(approval.createdAt).toLocaleString()}
        </span>
      </div>
    </Link>
  );
}
