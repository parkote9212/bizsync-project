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
      const response = await apiClient.get('/notifications');
      let allNotifications = response.data.content || [];

      // 필터 적용
      if (filter === 'unread') {
        allNotifications = allNotifications.filter((n: Notification) => !n.isRead);
      }

      setNotifications(allNotifications);
      setLoading(false);
    } catch (error) {
      console.error('알림 로딩 실패:', error);
      setNotifications([]);
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
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
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">알림</h1>
          <p className="text-sm text-gray-500 tabular-nums">
            읽지 않은 알림 {unreadCount}개
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium"
          >
            모두 읽음
          </button>
        )}
      </div>

      {/* 필터 */}
      <div className="mb-5">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 text-sm font-medium ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            읽지 않음
          </button>
        </div>
      </div>

      {/* 알림 목록 */}
      <div className="space-y-2">
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
      className={`bg-white border p-4 ${
        notification.isRead
          ? 'border-gray-200 opacity-60'
          : 'border-l-4 border-l-blue-600 border-t border-r border-b border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          onClick={handleClick}
          className={`flex-1 ${notification.url ? 'cursor-pointer' : ''}`}
        >
          <div className="flex items-center gap-2 mb-1">
            {!notification.isRead && (
              <span className="w-2 h-2 bg-blue-600" />
            )}
            <h3 className="text-sm font-semibold text-gray-900">
              {notification.title}
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {notification.senderName && (
              <span>발신: {notification.senderName}</span>
            )}
            <span className="tabular-nums">{new Date(notification.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          {!notification.isRead && (
            <button
              onClick={() => onMarkAsRead(notification.notificationId)}
              className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
            >
              읽음
            </button>
          )}
          <button
            onClick={() => onDelete(notification.notificationId)}
            className="px-2 py-1 text-xs text-red-600 hover:bg-red-50"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
