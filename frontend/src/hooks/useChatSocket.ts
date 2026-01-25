import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import { useChatStore } from "../stores/chatStore";
import { useUserStore } from "../stores/userStore";
import client from "../api/client";
import type { ChatMessage, ChatMember } from "../types/chat";

/**
 * 채팅 WebSocket 연결을 관리하는 커스텀 훅
 *
 * <p>특정 프로젝트(채팅방)의 실시간 채팅을 구독하고,
 * 메시지 전송 및 접속 상태 관리를 제공합니다.
 *
 * @param {number | null} roomId - 채팅방 ID (프로젝트 ID)
 * @returns {Object} WebSocket 관련 함수와 상태
 * @returns {Function} sendMessage - 메시지 전송 함수
 * @returns {boolean} isConnected - 연결 상태
 */
export const useChatSocket = (roomId: number | null) => {
  const stompClientRef = useRef<Client | null>(null);
  const { 
    addMessage, 
    setOnlineMembers, 
    setConnected,
    isConnected 
  } = useChatStore();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (!roomId) {
      // roomId가 없으면 연결 해제
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
        setConnected(false);
      }
      return;
    }

    // WebSocket URL 설정
    const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws";
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      console.error("Access token not found. Cannot connect to chat.");
      return;
    }

    console.log("Connecting to Chat WebSocket with token (length:", accessToken.length, ")");

    // STOMP 클라이언트 생성 및 설정
    const stompClient = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      // 연결 시 JWT 토큰을 헤더에 포함
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      
      // 디버깅용 로그
      debug: (str) => {
        if (str.includes("CONNECT") || str.includes("SEND") || str.includes("SUBSCRIBE") || str.includes("ERROR")) {
          console.log("[STOMP Debug]", str);
        }
      },

      onConnect: () => {
        console.log(`Connected to chat room ${roomId}`);
        setConnected(true);

        // 채팅방 메시지 구독
        stompClient.subscribe(`/topic/chat/room/${roomId}`, (message) => {
          if (message.body) {
            try {
              const chatMessage: ChatMessage = JSON.parse(message.body);
              addMessage(roomId, chatMessage);
            } catch (error) {
              console.error("Failed to parse chat message:", error);
            }
          }
        });

        // 접속 상태 구독
        stompClient.subscribe(`/topic/presence/${roomId}`, (message) => {
          if (message.body) {
            try {
              const onlineUserIds: number[] = JSON.parse(message.body);
              // 온라인 사용자 ID 목록을 받아서 멤버 정보와 매핑
              updateOnlineMembers(roomId, onlineUserIds);
            } catch (error) {
              console.error("Failed to parse presence update:", error);
            }
          }
        });
      },

      onDisconnect: () => {
        console.log(`Disconnected from chat room ${roomId}`);
        setConnected(false);
      },

      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"], frame.body);
        setConnected(false);
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    // 초기 온라인 멤버 목록 로드
    fetchOnlineMembers(roomId);

    // Cleanup
    return () => {
      console.log(`Disconnecting from chat room ${roomId}`);
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
      setConnected(false);
    };
  }, [roomId, addMessage, setOnlineMembers, setConnected]);

  /**
   * 온라인 멤버 목록 조회 및 업데이트
   */
  const fetchOnlineMembers = async (roomId: number) => {
    try {
      const response = await client.get(`/chat/room/${roomId}/members`);
      const roomMembers: { members: ChatMember[] } = response.data;
      setOnlineMembers(roomId, roomMembers.members);
    } catch (error) {
      console.error("Failed to fetch chat room members:", error);
    }
  };

  /**
   * 온라인 사용자 ID 목록으로 멤버 상태 업데이트
   */
  const updateOnlineMembers = async (roomId: number, onlineUserIds: number[]) => {
    try {
      const response = await client.get(`/chat/room/${roomId}/members`);
      const roomMembers: { members: ChatMember[] } = response.data;
      
      // 온라인 상태 업데이트
      const membersWithStatus = roomMembers.members.map((member) => ({
        ...member,
        isOnline: onlineUserIds.includes(member.userId),
      }));
      
      setOnlineMembers(roomId, membersWithStatus);
    } catch (error) {
      console.error("Failed to update online members:", error);
    }
  };

  /**
   * 메시지 전송
   *
   * @param {string} content - 메시지 내용
   */
  const sendMessage = (content: string) => {
    if (!stompClientRef.current || !stompClientRef.current.connected || !roomId) {
      console.error("Cannot send message: WebSocket not connected");
      return;
    }

    if (!content.trim()) {
      return;
    }

    const messagePayload = {
      roomId: roomId,
      content: content.trim(),
      messageType: "TEXT" as const,
    };

    stompClientRef.current.publish({
      destination: "/app/chat/message",
      body: JSON.stringify(messagePayload),
    });
  };

  return {
    sendMessage,
    isConnected,
  };
};
