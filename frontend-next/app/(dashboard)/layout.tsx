'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import apiClient from '@/lib/api';
import {
  DashboardIcon,
  ProjectIcon,
  ApprovalIcon,
  OrganizationIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
} from '@/components/icons';
import UserMenu from '@/components/UserMenu';

interface Notification {
  notificationId: number;
  userId: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // 다크모드 초기화
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedMode);
    if (savedMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    // 인증 확인 (BFF 응답이 data 래핑일 수 있으므로 유효한 토큰만 허용)
    const token = localStorage.getItem('accessToken');
    if (!token || token === 'undefined') {
      router.push('/login');
      return;
    }

    // 로그인 시 저장된 사용자 이름·이메일 사용
    const name = localStorage.getItem('userName') || '사용자';
    const email = localStorage.getItem('userEmail') || '';
    setUser({ name, email: email || 'user@example.com' });

    // 알림 로드
    loadNotifications();
  }, [router]);

  // 알림 드롭다운 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await apiClient.get<{ data?: Notification[]; content?: Notification[] }>('/notifications');
      const raw = response.data?.data ?? response.data?.content ?? [];
      const list = Array.isArray(raw) ? raw : [];
      const recent = list.slice(0, 5); // 최근 5개만
      setNotifications(recent);
      setUnreadCount(list.filter((n: Notification) => !n.isRead).length);
    } catch (error) {
      console.error('알림 로드 실패:', error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    router.push('/login');
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const navItems = [
    { name: '대시보드', path: '/dashboard', Icon: DashboardIcon },
    { name: '프로젝트', path: '/projects', Icon: ProjectIcon },
    { name: '결재', path: '/approvals', Icon: ApprovalIcon },
    { name: '조직도', path: '/organization', Icon: OrganizationIcon },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* 사이드바: 타이틀 + 네비 */}
      <aside className="w-64 shrink-0 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col min-h-screen">
        <div className="p-4 text-center">
          <Link
            href="/dashboard"
            className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            BizSync
          </Link>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <item.Icon className="w-6 h-6" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* 오른쪽 영역: 상단 헤더 + 메인 */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="h-full px-4 sm:px-6 flex justify-end items-center gap-4">
              {/* 알림 드롭다운 */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  title="알림"
                >
                  <BellIcon className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center tabular-nums">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">알림</h3>
                      <Link
                        href="/notifications"
                        onClick={() => setNotificationOpen(false)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        전체보기
                      </Link>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                          알림이 없습니다
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.notificationId}
                            onClick={() => {
                              if (!notification.isRead) {
                                markAsRead(notification.notificationId);
                              }
                            }}
                            className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                              !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {!notification.isRead && (
                                <div className="shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1.5" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {new Date(notification.createdAt).toLocaleString('ko-KR', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 다크모드 토글 */}
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                title={darkMode ? '라이트 모드' : '다크 모드'}
              >
                {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              </button>

              {/* 사용자 메뉴 */}
              <UserMenu userName={user.name} userEmail={user.email} />

              {/* 로그아웃 버튼 */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                로그아웃
              </button>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-900 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
