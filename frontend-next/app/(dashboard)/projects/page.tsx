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
      const response = await apiClient.get('/projects');
      setProjects(response.data.content || []);
      setLoading(false);
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">프로젝트</h1>
          <p className="text-sm text-gray-500">참여 중인 프로젝트 목록</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
          + 새 프로젝트
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.projectId} project={project} />
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const statusColors = {
    PLANNED: 'bg-gray-100 text-gray-700 border-gray-200',
    IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    HOLD: 'bg-amber-50 text-amber-700 border-amber-200',
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
      className="block bg-white border border-gray-200 hover:border-gray-300 p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
          {project.name}
        </h3>
        <span className={`inline-flex px-2 py-0.5 border text-xs font-medium ${statusColors[project.status]}`}>
          {statusLabels[project.status]}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {project.description || '설명 없음'}
      </p>

      <div className="space-y-3 text-sm">
        {project.startDate && project.endDate && (
          <div className="flex items-center text-gray-500 text-xs">
            <span className="mr-2">📅</span>
            <span className="tabular-nums">
              {new Date(project.startDate).toLocaleDateString()} ~{' '}
              {new Date(project.endDate).toLocaleDateString()}
            </span>
          </div>
        )}

        {project.budget && (
          <div>
            <div className="flex items-center justify-between text-gray-500 text-xs mb-1.5">
              <span className="flex items-center">
                <span className="mr-2">💰</span>
                예산 사용률
              </span>
              <span className="font-medium tabular-nums">{budgetPercentage}%</span>
            </div>
            <div className="w-full bg-gray-100 border border-gray-200 h-1.5">
              <div
                className="bg-blue-600 h-full"
                style={{ width: `${budgetPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
