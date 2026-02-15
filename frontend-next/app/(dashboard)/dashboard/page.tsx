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
      // 추후 실제 API 연동
      // const response = await apiClient.get('/dashboard/stats');
      // setStats(response.data);

      // 임시 데이터
      setTimeout(() => {
        setStats({
          projectCount: 5,
          taskCount: 23,
          pendingApprovalCount: 3,
          unreadNotificationCount: 7,
        });
        setLoading(false);
      }, 500);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-2 text-gray-600">프로젝트 현황을 한눈에 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">최근 활동</h2>
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
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red: 'bg-red-50 text-red-700',
  }[color];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full ${colorClasses} flex items-center justify-center text-2xl`}>
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
    <div className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="flex-shrink-0 text-xs text-gray-500">{time}</div>
    </div>
  );
}
