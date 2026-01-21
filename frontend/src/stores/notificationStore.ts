import { create } from "zustand";
import { persist } from "zustand/middleware";

// 알림 타입 (WebSocket에서 받는 형식 + 클라이언트 상태)
export interface Notification {
  type: string; // 알림 유형 (예: APPROVAL, TASK, SYSTEM)
  message: string; // 알림 내용
  targetId?: number; // 클릭 시 이동할 ID (백엔드에서 선택적으로 제공)
  createdAt?: string; // 백엔드에서 받은 생성 시간
  id?: string; // 클라이언트에서 생성하는 임시 ID (store에서 추가)
  timestamp?: number; // 클라이언트에서 받은 시간 (ms, store에서 추가)
  read?: boolean; // 읽음 여부 (store에서 추가)
}

// Notification Store 인터페이스
interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  setNotifications: (notifications: Notification[]) => void;
  // TODO: 백엔드 API 연동 필요
  // fetchNotifications: () => Promise<void>;
  // markAsReadOnServer: (id: string) => Promise<void>;
  // removeNotificationOnServer: (id: string) => Promise<void>;
}

// 초기 상태
const initialNotifications: Notification[] = [];

// Notification Store 생성
export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: initialNotifications,
      unreadCount: 0,

      // 알림 추가 (WebSocket에서 받은 알림)
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: notification.id || `temp-${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          read: false,
        };
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },

      // 읽음 처리
      markAsRead: (id) => {
        set((state) => {
          const updated = state.notifications.map((notif) =>
            notif.id === id ? { ...notif, read: true } : notif
          );
          const unreadCount = updated.filter((notif) => !notif.read).length;
          return { notifications: updated, unreadCount };
        });
      },

      // 전체 읽음 처리
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((notif) => ({ ...notif, read: true })),
          unreadCount: 0,
        }));
      },

      // 알림 삭제
      removeNotification: (id) => {
        set((state) => {
          const updated = state.notifications.filter((notif) => notif.id !== id);
          const unreadCount = updated.filter((notif) => !notif.read).length;
          return { notifications: updated, unreadCount };
        });
      },

      // 전체 삭제
      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      // 알림 목록 설정 (백엔드 API에서 받은 데이터로 초기화)
      setNotifications: (notifications) => {
        const unreadCount = notifications.filter((notif) => !notif.read).length;
        set({ notifications, unreadCount });
      },
    }),
    {
      name: "notification-storage",
    }
  )
);
