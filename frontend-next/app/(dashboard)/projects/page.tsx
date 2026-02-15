'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api';
import type { Project, ProjectStatus } from '@/types';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      // 추후 실제 API 연동
      // const response = await apiClient.get('/projects/my');
      // setProjects(response.data.content);

      // 임시 데이터
      setTimeout(() => {
        setProjects([
          {
            projectId: 1,
            name: 'BizSync v2 업그레이드',
            description: 'Next.js 15로 프론트엔드 전환 및 Kafka 이벤트 아키텍처 적용',
            status: 'IN_PROGRESS' as ProjectStatus,
            startDate: '2025-01-01',
            endDate: '2025-03-31',
            budget: 50000000,
            usedBudget: 12000000,
            createdAt: '2025-01-01T00:00:00',
          },
          {
            projectId: 2,
            name: '모바일 앱 개발',
            description: 'React Native 기반 모바일 애플리케이션',
            status: 'PLANNED' as ProjectStatus,
            startDate: '2025-02-01',
            endDate: '2025-05-31',
            budget: 80000000,
            usedBudget: 0,
            createdAt: '2025-01-15T00:00:00',
          },
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('프로젝트 목록 로딩 실패:', error);
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">프로젝트</h1>
          <p className="mt-2 text-gray-600">참여 중인 프로젝트 목록</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          + 새 프로젝트
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.projectId} project={project} />
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const statusColors = {
    PLANNED: 'bg-gray-100 text-gray-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    HOLD: 'bg-yellow-100 text-yellow-700',
  };

  const statusLabels = {
    PLANNED: '계획',
    IN_PROGRESS: '진행 중',
    COMPLETED: '완료',
    HOLD: '보류',
  };

  const budgetPercentage = project.budget && project.usedBudget
    ? Math.round((project.usedBudget / project.budget) * 100)
    : 0;

  return (
    <Link
      href={`/projects/${project.projectId}`}
      className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
          {project.name}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
          {statusLabels[project.status]}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {project.description || '설명 없음'}
      </p>

      <div className="space-y-2 text-sm">
        {project.startDate && project.endDate && (
          <div className="flex items-center text-gray-600">
            <span className="mr-2">📅</span>
            <span>
              {new Date(project.startDate).toLocaleDateString()} ~{' '}
              {new Date(project.endDate).toLocaleDateString()}
            </span>
          </div>
        )}

        {project.budget && (
          <div>
            <div className="flex items-center justify-between text-gray-600 mb-1">
              <span className="flex items-center">
                <span className="mr-2">💰</span>
                예산
              </span>
              <span className="font-medium">{budgetPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${budgetPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
