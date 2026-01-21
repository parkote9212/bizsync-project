import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import type { Notification } from "../stores/notificationStore";

/**
 * [알림 WebSocket Hook]
 * 순수 WebSocket(ws://) + brokerURL. 로그인 사용자 알림 실시간 구독.
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

    client.current = new Client({
      brokerURL: "ws://localhost:8080/ws",
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log(`Connected to Notification WebSocket for user ${userId}`);
        setConnected(true);
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
        console.error("Notification WebSocket error: " + (frame?.headers?.["message"] ?? frame?.body ?? "unknown"));
      },
    });

    client.current.activate();

    return () => {
      console.log("Disconnecting from Notification WebSocket...");
      client.current?.deactivate();
      setConnected(false);
    };
  }, [userId, onNotification]);

  return { connected };
};
