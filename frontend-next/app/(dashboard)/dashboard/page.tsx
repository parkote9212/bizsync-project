'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    projectCount: 0,
    taskCount: 0,
    pendingApprovalCount: 0,
    unreadNotificationCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // TODO: 대시보드 통계 API가 구현되면 연동 (Phase 6)
      // const response = await apiClient.get('/dashboard/stats');
      // setStats(response.data);

      // 임시로 각 API에서 카운트 조회
      const [projectsRes, approvalsRes, notificationsRes] = await Promise.all([
        apiClient.get('/projects').catch(() => ({ data: { content: [] } })),
        apiClient.get('/approvals/my-pending').catch(() => ({ data: { content: [] } })),
        apiClient.get('/notifications').catch(() => ({ data: { content: [] } })),
      ]);

      setStats({
        projectCount: projectsRes.data.content?.length || 0,
        taskCount: 0, // 업무 API 미구현
        pendingApprovalCount: approvalsRes.data.content?.length || 0,
        unreadNotificationCount: notificationsRes.data.content?.filter((n: any) => !n.isRead).length || 0,
      });
      setLoading(false);
    } catch (error) {
      console.error('대시보드 데이터 로딩 실패:', error);
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
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">대시보드</h1>
        <p className="text-sm text-gray-500">프로젝트 현황을 한눈에 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="진행 중인 프로젝트"
          value={stats.projectCount}
          icon="📁"
          color="blue"
        />
        <StatCard
          title="내 업무"
          value={stats.taskCount}
          icon="📋"
          color="green"
        />
        <StatCard
          title="대기 중인 결재"
          value={stats.pendingApprovalCount}
          icon="✅"
          color="yellow"
        />
        <StatCard
          title="읽지 않은 알림"
          value={stats.unreadNotificationCount}
          icon="🔔"
          color="red"
        />
      </div>

      {/* 최근 활동 */}
      <div className="bg-white border border-gray-200 p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">최근 활동</h2>
        <div className="space-y-4">
          <ActivityItem
            icon="📁"
            title="새 프로젝트 시작"
            description="BizSync v2 업그레이드 프로젝트가 시작되었습니다"
            time="2시간 전"
          />
          <ActivityItem
            icon="✅"
            title="결재 승인"
            description="비용 결재 문서가 승인되었습니다"
            time="5시간 전"
          />
          <ActivityItem
            icon="📋"
            title="업무 완료"
            description="Next.js 프로젝트 셋업 업무를 완료했습니다"
            time="1일 전"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-emerald-600',
    yellow: 'text-amber-600',
    red: 'text-red-600',
  }[color];

  return (
    <div className="bg-white border border-gray-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 tabular-nums">{value}</p>
        </div>
        <div className={`text-xl ${colorClasses}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function ActivityItem({
  icon,
  title,
  description,
  time,
}: {
  icon: string;
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex items-start gap-3 pb-3 border-b border-gray-200 last:border-0 last:pb-0">
      <div className="flex-shrink-0 w-8 h-8 bg-gray-50 border border-gray-200 flex items-center justify-center text-base">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <div className="flex-shrink-0 text-xs text-gray-500 tabular-nums">{time}</div>
    </div>
  );
}
