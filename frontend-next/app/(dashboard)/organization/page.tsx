'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api';
import { SearchIcon } from '@/components/icons';

interface User {
  userId: number;
  name: string;
  email: string;
  department?: string;
  empNo?: string;
  position?: string;
  status?: string;
}

export default function OrganizationPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await apiClient.get<{ data?: User[] }>('/users');
      const list = response.data?.data ?? response.data;
      setUsers(Array.isArray(list) ? list : []);
      setLoading(false);
    } catch (error) {
      console.error('사용자 목록 조회 실패:', error);
      setUsers([]);
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      (user.department && user.department.toLowerCase().includes(search)) ||
      (user.empNo && user.empNo.toLowerCase().includes(search))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900 mb-1">조직도</h1>
        <p className="text-sm text-gray-500">전체 구성원 목록을 확인할 수 있습니다</p>
      </div>

      {/* 검색 */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="이름, 이메일, 부서, 사번으로 검색..."
            className="w-full px-4 py-2 pl-10 text-sm text-gray-900 bg-white border border-gray-300 rounded-md placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <SearchIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* 사용자 목록 */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-500">
          {searchTerm ? '검색 결과가 없습니다.' : '등록된 사용자가 없습니다.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <div
              key={user.userId}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-lg">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{user.name}</h3>
                    {user.status === 'ACTIVE' && (
                      <span className="flex-shrink-0 inline-flex px-2 py-0.5 text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full">
                        활성
                      </span>
                    )}
                  </div>
                  <div className="space-y-0.5 text-xs text-gray-600">
                    <div className="truncate">{user.email}</div>
                    {user.department && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">부서:</span>
                        <span>{user.department}</span>
                      </div>
                    )}
                    {user.position && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">직급:</span>
                        <span>{user.position}</span>
                      </div>
                    )}
                    {user.empNo && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">사번:</span>
                        <span className="font-mono">{user.empNo}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 통계 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          전체 <span className="font-semibold text-gray-900 tabular-nums">{users.length}</span>명
          {searchTerm && (
            <>
              {' '}
              / 검색 결과 <span className="font-semibold text-gray-900 tabular-nums">{filteredUsers.length}</span>명
            </>
          )}
        </div>
      </div>
    </div>
  );
}
