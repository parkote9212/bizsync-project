'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api';
import type { Project, ProjectStatus } from '@/types';
import { CalendarIcon, CashIcon, PlusIcon } from '@/components/icons';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    totalBudget: '',
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await apiClient.get<{ data?: Project[]; content?: Project[] }>('/projects');
      const raw = response.data?.data ?? response.data?.content ?? [];
      const list = Array.isArray(raw) ? raw : [];
      // 백엔드 ProjectListResponseDTO: totalBudget, usedBudget
      setProjects(list.map((p: any) => ({
        ...p,
        budget: p.budget ?? p.totalBudget,
        totalBudget: p.totalBudget ?? p.budget,
        usedBudget: p.usedBudget ?? 0,
        status: p.status ?? 'PLANNED',
      })));
      setLoading(false);
    } catch (error) {
      console.error('프로젝트 목록 로딩 실패:', error);
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/projects', {
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalBudget: formData.totalBudget ? Number(formData.totalBudget) : 0,
      });
      setCreateModalOpen(false);
      setFormData({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        totalBudget: '',
      });
      loadProjects();
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
      alert('프로젝트 생성에 실패했습니다.');
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
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 rounded-md"
        >
          <PlusIcon className="w-4 h-4" />
          새 프로젝트
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.projectId} project={project} />
        ))}
      </div>

      {/* 프로젝트 생성 모달 - 배경 블러 처리 */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">새 프로젝트 생성</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  프로젝트 이름 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    시작일 *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    종료일 *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">총 예산</label>
                <input
                  type="number"
                  value={formData.totalBudget}
                  onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  생성
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function formatBudget(value: number | undefined | null): string {
  if (value == null || Number.isNaN(value)) return '0원';
  return `${Number(value).toLocaleString('ko-KR')}원`;
}

function ProjectCard({ project }: { project: Project }) {
  const statusColors: Record<string, string> = {
    PLANNED: 'bg-gray-100 text-gray-800 border-gray-200',
    PLANNING: 'bg-gray-100 text-gray-800 border-gray-200',
    IN_PROGRESS: 'bg-blue-50 text-blue-800 border-blue-200',
    COMPLETED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    HOLD: 'bg-amber-50 text-amber-800 border-amber-200',
    ON_HOLD: 'bg-amber-50 text-amber-800 border-amber-200',
    CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
    ARCHIVED: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  const statusLabels: Record<string, string> = {
    PLANNED: '계획',
    PLANNING: '기획',
    IN_PROGRESS: '진행 중',
    COMPLETED: '완료',
    HOLD: '보류',
    ON_HOLD: '보류',
    CANCELLED: '취소',
    ARCHIVED: '아카이브',
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
        <span className={`inline-flex px-2 py-0.5 border text-xs font-medium text-gray-900 ${statusColors[project.status] ?? 'bg-gray-100 text-gray-800 border-gray-200'}`}>
          {statusLabels[project.status] ?? project.status}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {project.description || '설명 없음'}
      </p>

      <div className="space-y-3 text-sm">
        {project.startDate && project.endDate && (
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <CalendarIcon className="w-4 h-4 shrink-0" />
            <span className="tabular-nums">
              {new Date(project.startDate).toLocaleDateString()} ~{' '}
              {new Date(project.endDate).toLocaleDateString()}
            </span>
          </div>
        )}

        {(project.budget != null || project.usedBudget != null) && (
          <div>
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <CashIcon className="w-4 h-4 shrink-0" />
              <span className="tabular-nums text-gray-900">
                총 예산 {formatBudget(project.totalBudget ?? project.budget)} · 소진 {formatBudget(project.usedBudget ?? 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-gray-500 text-xs mb-1.5">
              <span>예산 사용률</span>
              <span className="font-medium tabular-nums text-gray-900">{budgetPercentage}%</span>
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
