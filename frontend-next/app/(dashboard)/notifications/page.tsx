'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api';

interface Notification {
  notificationId: number;
  senderId?: number;
  senderName?: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: number;
  url?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    try {
      // 추후 실제 API 연동
      // const response = await apiClient.get('/notifications', {
      //   params: { unread: filter === 'unread' },
      // });
      // setNotifications(response.data.content);

      // 임시 데이터
      setTimeout(() => {
        const allNotifications: Notification[] = [
          {
            notificationId: 1,
            senderName: '시스템',
            title: '새 업무 배정',
            message: '칸반 보드 구현 업무가 배정되었습니다.',
            entityType: 'TASK',
            entityId: 3,
            url: '/kanban',
            isRead: false,
            createdAt: '2025-02-15T14:30:00',
          },
          {
            notificationId: 2,
            senderName: '김팀장',
            title: '결재 요청',
            message: '서버 증설 비용 결재 요청이 도착했습니다.',
            entityType: 'APPROVAL',
            entityId: 1,
            url: '/approvals/1',
            isRead: false,
            createdAt: '2025-02-15T10:15:00',
          },
          {
            notificationId: 3,
            senderName: '홍길동',
            title: '프로젝트 초대',
            message: 'BizSync v2 프로젝트에 초대되었습니다.',
            entityType: 'PROJECT',
            entityId: 1,
            url: '/projects/1',
            isRead: true,
            readAt: '2025-02-15T09:00:00',
            createdAt: '2025-02-15T08:00:00',
          },
          {
            notificationId: 4,
            senderName: '시스템',
            title: '업무 마감 임박',
            message: 'Next.js 프로젝트 셋업 업무의 마감일이 5일 남았습니다.',
            entityType: 'TASK',
            entityId: 1,
            url: '/kanban',
            isRead: true,
            readAt: '2025-02-14T15:00:00',
            createdAt: '2025-02-14T09:00:00',
          },
        ];

        const filtered = filter === 'unread'
          ? allNotifications.filter((n) => !n.isRead)
          : allNotifications;

        setNotifications(filtered);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('알림 로딩 실패:', error);
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      // await apiClient.patch(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notificationId
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n
        )
      );
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // await apiClient.patch('/notifications/read-all');
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
          readAt: n.readAt || new Date().toISOString(),
        }))
      );
    } catch (error) {
      console.error('전체 읽음 처리 실패:', error);
    }
  };

  const handleDelete = async (notificationId: number) => {
    if (!confirm('알림을 삭제하시겠습니까?')) return;

    try {
      // await apiClient.delete(`/notifications/${notificationId}`);
      setNotifications((prev) =>
        prev.filter((n) => n.notificationId !== notificationId)
      );
    } catch (error) {
      console.error('알림 삭제 실패:', error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
          <h1 className="text-3xl font-bold text-gray-900">알림</h1>
          <p className="mt-2 text-gray-600">
            읽지 않은 알림 {unreadCount}개
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
          >
            모두 읽음
          </button>
        )}
      </div>

      {/* 필터 */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            읽지 않음
          </button>
        </div>
      </div>

      {/* 알림 목록 */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            알림이 없습니다.
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationCard
              key={notification.notificationId}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.notificationId);
    }
    if (notification.url) {
      window.location.href = notification.url;
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-4 transition-all ${
        notification.isRead ? 'opacity-70' : 'border-l-4 border-blue-500'
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          onClick={handleClick}
          className={`flex-1 ${notification.url ? 'cursor-pointer' : ''}`}
        >
          <div className="flex items-center space-x-2 mb-1">
            {!notification.isRead && (
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
            )}
            <h3 className="font-semibold text-gray-900">
              {notification.title}
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            {notification.senderName && (
              <span>발신: {notification.senderName}</span>
            )}
            <span>{new Date(notification.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {!notification.isRead && (
            <button
              onClick={() => onMarkAsRead(notification.notificationId)}
              className="px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              읽음
            </button>
          )}
          <button
            onClick={() => onDelete(notification.notificationId)}
            className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
