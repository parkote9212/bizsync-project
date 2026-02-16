'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

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
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    router.push('/login');
  };

  const navItems = [
    { name: '대시보드', path: '/dashboard', icon: '📊' },
    { name: '프로젝트', path: '/projects', icon: '📁' },
    { name: '결재', path: '/approvals', icon: '✅' },
    { name: '조직도', path: '/organization', icon: '👥' },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
                BizSync
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/notifications"
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
                title="알림"
              >
                <span className="text-lg" aria-hidden>🔔</span>
                <span className="hidden sm:inline">알림</span>
              </Link>
              <div className="text-sm text-gray-700">
                <span className="font-medium text-gray-900">{user.name}</span>
                {user.email && <span className="text-gray-500"> · {user.email}</span>}
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 사이드바 */}
        <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  pathname === item.path
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
