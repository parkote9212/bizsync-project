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

    const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws";
    // JWT 토큰 가져오기
    const accessToken = localStorage.getItem("accessToken");
    
    if (!accessToken) {
      console.warn("Access token not found. WebSocket connection may fail.");
    } else {
      console.log("Connecting to Notification WebSocket with token (length:", accessToken.length, ")");
    }
    
    client.current = new Client({
      brokerURL: WS_URL,
      connectHeaders: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        if (str.includes("CONNECT") || str.includes("SEND") || str.includes("SUBSCRIBE") || str.includes("ERROR")) {
          console.log("[STOMP Debug - Notification]", str);
        }
      },
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
