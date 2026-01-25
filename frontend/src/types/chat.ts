/**
 * 채팅 관련 타입 정의
 */

/**
 * 메시지 타입
 */
export type MessageType = "TEXT" | "FILE" | "SYSTEM";

/**
 * 채팅 메시지 인터페이스
 */
export interface ChatMessage {
  id: number;
  roomId: number;
  senderId: number;
  senderName: string;
  content: string;
  messageType: MessageType;
  sentAt: string;
}

/**
 * 채팅방 정보 인터페이스
 */
export interface ChatRoom {
  roomId: number;
  name: string;
  description: string;
}

/**
 * 채팅방 멤버 정보 인터페이스
 */
export interface ChatMember {
  userId: number;
  name: string;
  email: string;
  isOnline: boolean;
}

/**
 * 채팅방 멤버 목록 인터페이스
 */
export interface ChatRoomMembers {
  members: ChatMember[];
}

/**
 * 채팅 히스토리 응답 인터페이스
 */
export interface ChatHistoryResponse {
  messages: ChatMessage[];
  hasMore: boolean;
  oldestCursor: string | null; // ISO 8601 형식의 LocalDateTime 문자열
}
