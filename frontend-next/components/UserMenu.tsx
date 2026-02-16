'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';

interface UserMenuProps {
  userName: string;
  userEmail: string;
}

interface UserDetail {
  userId: number;
  name: string;
  email: string;
  department?: string;
  position?: string;
  empNo?: string;
  status?: string;
  hasOAuthLinked?: boolean;
}

export default function UserMenu({ userName, userEmail }: UserMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUnlinkModal, setShowUnlinkModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && !userDetail) {
      loadUserDetail();
    }
  }, [isOpen]);

  const loadUserDetail = async () => {
    try {
      // 현재 사용자 정보 조회 (임시로 localStorage 사용, 실제로는 API 호출)
      // TODO: GET /api/users/me 엔드포인트 구현 필요
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      const response = await apiClient.get<{ data?: UserDetail }>(`/users/${userId}`);
      const detail = response.data?.data ?? response.data;
      setUserDetail(detail as UserDetail);
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error);
      // 임시 데이터
      setUserDetail({
        userId: 1,
        name: userName,
        email: userEmail,
        department: '개발팀',
        position: '대리',
        empNo: 'EMP001',
        status: 'ACTIVE',
        hasOAuthLinked: false,
      });
    }
  };

  const handlePasswordChange = async (oldPassword: string, newPassword: string) => {
    try {
      await apiClient.patch('/users/me/password', { oldPassword, newPassword });
      alert('비밀번호가 변경되었습니다.');
      setShowPasswordModal(false);
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      alert('비밀번호 변경에 실패했습니다.');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await apiClient.delete('/users/me');
      alert('회원 탈퇴가 완료되었습니다.');
      localStorage.clear();
      router.push('/login');
    } catch (error) {
      console.error('회원 탈퇴 실패:', error);
      alert('회원 탈퇴에 실패했습니다.');
    }
  };

  const handleUnlinkOAuth = async () => {
    try {
      await apiClient.delete('/users/me/oauth');
      alert('소셜 계정 연동이 해제되었습니다.');
      setShowUnlinkModal(false);
      loadUserDetail();
    } catch (error) {
      console.error('연동 해제 실패:', error);
      alert('연동 해제에 실패했습니다.');
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
      >
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
          <span className="text-blue-600 dark:text-blue-300 font-semibold text-sm">{userName.charAt(0)}</span>
        </div>
        <div className="text-left">
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {userDetail?.position ? `${userDetail.position} ` : ''}{userName} 님
          </div>
        </div>
        <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          {/* 사용자 정보 */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center shrink-0">
                <span className="text-blue-600 dark:text-blue-300 font-semibold text-lg">{userName.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 dark:text-gray-100">{userName}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{userEmail}</div>
                {userDetail?.department && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {userDetail.department} · {userDetail.position}
                  </div>
                )}
                {userDetail?.empNo && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">사번: {userDetail.empNo}</div>
                )}
              </div>
            </div>
          </div>

          {/* 메뉴 항목 */}
          <div className="py-2">
            <button
              onClick={() => {
                setShowPasswordModal(true);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              비밀번호 변경
            </button>
            {userDetail?.hasOAuthLinked && (
              <button
                onClick={() => {
                  setShowUnlinkModal(true);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                소셜 계정 연동 해제
              </button>
            )}
            <button
              onClick={() => {
                setShowDeleteModal(true);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              회원 탈퇴
            </button>
          </div>
        </div>
      )}

      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && (
        <PasswordChangeModal
          onClose={() => setShowPasswordModal(false)}
          onSubmit={handlePasswordChange}
        />
      )}

      {/* 회원 탈퇴 모달 */}
      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
        />
      )}

      {/* OAuth 연동 해제 모달 */}
      {showUnlinkModal && (
        <UnlinkOAuthModal
          onClose={() => setShowUnlinkModal(false)}
          onConfirm={handleUnlinkOAuth}
        />
      )}
    </div>
  );
}

function PasswordChangeModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (oldPassword: string, newPassword: string) => void;
}) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (newPassword.length < 8) {
      alert('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    onSubmit(oldPassword, newPassword);
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">비밀번호 변경</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              현재 비밀번호 *
            </label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              새 비밀번호 * (8자 이상)
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              새 비밀번호 확인 *
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              변경
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteAccountModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [confirmText, setConfirmText] = useState('');

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">회원 탈퇴</h2>
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            ⚠️ 회원 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            탈퇴하려면 <strong>"회원탈퇴"</strong>를 입력하세요
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="회원탈퇴"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmText !== '회원탈퇴'}
            className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            탈퇴하기
          </button>
        </div>
      </div>
    </div>
  );
}

function UnlinkOAuthModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">소셜 계정 연동 해제</h2>
        <p className="text-sm text-gray-600 mb-4">
          소셜 계정 연동을 해제하시겠습니까? 해제 후에는 이메일과 비밀번호로만 로그인할 수
          있습니다.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            연동 해제
          </button>
        </div>
      </div>
    </div>
  );
}
