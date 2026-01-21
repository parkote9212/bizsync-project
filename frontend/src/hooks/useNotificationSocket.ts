import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { Notification } from "../stores/notificationStore";

/**
 * [알림 WebSocket Hook]
 * 현재 로그인한 사용자의 알림을 실시간으로 구독합니다.
 * @param userId 로그인한 사용자 ID
 * @param onNotification 알림 수신 시 실행될 콜백 함수
 */
export const useNotificationSocket = (
  userId: number | null,
  onNotification: (notification: Notification) => void,
) => {
  const [connected, setConnected] = useState(false);
  const client = useRef<Client | null>(null);

  useEffect(() => {
    if (!userId) return;

    // 1. 클라이언트 설정
    client.current = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log(`Connected to Notification WebSocket for user ${userId}`);
        setConnected(true);

        // 2. 구독 (Subscribe): /sub/notification/{userId}
        client.current?.subscribe(`/sub/notification/${userId}`, (message) => {
          if (message.body) {
            try {
              const notification: Notification = JSON.parse(message.body);
              console.log("Notification received:", notification);
              onNotification(notification);
            } catch (error) {
              console.error("Failed to parse notification:", error);
            }
          }
        });
      },
      onDisconnect: () => {
        console.log("Disconnected from Notification WebSocket");
        setConnected(false);
      },
      onStompError: (frame) => {
        console.error("Notification WebSocket error: " + frame.headers["message"]);
      },
    });

    // 3. 활성화
    client.current.activate();

    // 4. Cleanup: 컴포넌트 언마운트 시 연결 종료
    return () => {
      console.log("Disconnecting from Notification WebSocket...");
      client.current?.deactivate();
      setConnected(false);
    };
  }, [userId, onNotification]);

  return { connected };
};
