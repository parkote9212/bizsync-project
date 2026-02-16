'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api';
import {
  ProjectIcon,
  TaskIcon,
  ApprovalIcon,
  BellIcon,
  ClockIcon,
  DocumentIcon,
} from '@/components/icons';

interface ActivityLogItem {
  logId: number;
  action: string;
  entityType?: string;
  entityName?: string;
  userName?: string;
  projectName?: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    projectCount: 0,
    taskCount: 0,
    pendingApprovalCount: 0,
    unreadNotificationCount: 0,
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [projectsRes, approvalsRes, notificationsRes, activityRes] = await Promise.all([
        apiClient.get('/projects').catch(() => ({ data: { data: [] } })),
        apiClient.get('/approvals/my-pending').catch(() => ({ data: { content: [], data: { content: [] } } })),
        apiClient.get('/notifications').catch(() => ({ data: { content: [], data: { content: [] } } })),
        apiClient.get('/activity-logs/my?size=10').catch(() => ({ data: { content: [] } })),
      ]);

      const projectsList = Array.isArray(projectsRes.data?.data) ? projectsRes.data.data : [];
      const approvalsData = approvalsRes.data?.data ?? approvalsRes.data;
      const approvalsList = Array.isArray(approvalsData?.content) ? approvalsData.content : [];
      const notifData = notificationsRes.data?.data ?? notificationsRes.data;
      const notifList = Array.isArray(notifData?.content) ? notifData.content : [];
      const activityData = activityRes.data?.content ?? activityRes.data?.data ?? [];
      const activityList = Array.isArray(activityData) ? activityData : [];

      setStats({
        projectCount: projectsList.length,
        taskCount: 0,
        pendingApprovalCount: approvalsList.length,
        unreadNotificationCount: notifList.filter((n: { isRead?: boolean }) => !n.isRead).length,
      });
      setActivityLogs(
        activityList.map((a: any) => ({
          logId: a.logId,
          action: a.action ?? '',
          entityType: a.entityType,
          entityName: a.entityName,
          userName: a.userName,
          projectName: a.projectName,
          createdAt: a.createdAt,
        }))
      );
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
          Icon={ProjectIcon}
          color="blue"
        />
        <StatCard
          title="내 업무"
          value={stats.taskCount}
          Icon={TaskIcon}
          color="green"
        />
        <StatCard
          title="대기 중인 결재"
          value={stats.pendingApprovalCount}
          Icon={ApprovalIcon}
          color="yellow"
        />
        <StatCard
          title="읽지 않은 알림"
          value={stats.unreadNotificationCount}
          Icon={BellIcon}
          color="red"
        />
      </div>

      {/* 최근 활동 - 백엔드 /api/activity-logs/my 연동 */}
      <div className="bg-white border border-gray-200 p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">최근 활동</h2>
        <div className="space-y-4">
          {activityLogs.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">최근 활동이 없습니다.</p>
          ) : (
            activityLogs.map((log) => (
              <ActivityItem
                key={log.logId}
                Icon={getActivityIcon(log.entityType)}
                title={log.action}
                description={[log.projectName, log.entityName].filter(Boolean).join(' · ') || '-'}
                time={formatTimeAgo(log.createdAt)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  Icon,
  color,
}: {
  title: string;
  value: number;
  Icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-emerald-600 bg-emerald-50',
    yellow: 'text-amber-600 bg-amber-50',
    red: 'text-red-600 bg-red-50',
  }[color];

  return (
    <div className="bg-white border border-gray-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 tabular-nums">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function getActivityIcon(entityType?: string): React.ComponentType<{ className?: string }> {
  switch (entityType?.toUpperCase()) {
    case 'PROJECT':
      return ProjectIcon;
    case 'TASK':
      return TaskIcon;
    case 'APPROVAL':
      return ApprovalIcon;
    default:
      return DocumentIcon;
  }
}

function formatTimeAgo(createdAt: string): string {
  const date = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffM = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);
  if (diffM < 1) return '방금 전';
  if (diffM < 60) return `${diffM}분 전`;
  if (diffH < 24) return `${diffH}시간 전`;
  if (diffD < 7) return `${diffD}일 전`;
  return date.toLocaleDateString('ko-KR');
}

function ActivityItem({
  Icon,
  title,
  description,
  time,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex items-start gap-3 pb-3 border-b border-gray-200 last:border-0 last:pb-0">
      <div className="shrink-0 w-8 h-8 bg-gray-50 border border-gray-200 flex items-center justify-center">
        <Icon className="w-4 h-4 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <div className="shrink-0 text-xs text-gray-500 tabular-nums">{time}</div>
    </div>
  );
}
