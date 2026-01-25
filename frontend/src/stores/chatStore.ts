import { create } from "zustand";
import type { ChatMessage, ChatMember } from "../types/chat";

/**
 * 채팅 스토어 상태 인터페이스
 */
interface ChatStore {
  // 현재 선택된 채팅방 ID
  currentRoomId: number | null;
  
  // 채팅방별 메시지 목록 (roomId -> messages)
  messages: Map<number, ChatMessage[]>;
  
  // 채팅방별 온라인 멤버 목록 (roomId -> members)
  onlineMembers: Map<number, ChatMember[]>;
  
  // WebSocket 연결 상태
  isConnected: boolean;
  
  // 로딩 상태
  isLoading: boolean;
  
  // 액션
  setCurrentRoomId: (roomId: number | null) => void;
  addMessage: (roomId: number, message: ChatMessage) => void;
  setMessages: (roomId: number, messages: ChatMessage[]) => void;
  appendMessages: (roomId: number, messages: ChatMessage[]) => void;
  setOnlineMembers: (roomId: number, members: ChatMember[]) => void;
  setConnected: (connected: boolean) => void;
  setLoading: (loading: boolean) => void;
  clearRoom: (roomId: number) => void;
  reset: () => void;
}

/**
 * 채팅 스토어 생성
 *
 * <p>채팅 메시지, 온라인 멤버, 연결 상태 등을 관리합니다.
 */
export const useChatStore = create<ChatStore>((set) => ({
  currentRoomId: null,
  messages: new Map(),
  onlineMembers: new Map(),
  isConnected: false,
  isLoading: false,

  setCurrentRoomId: (roomId) => set({ currentRoomId: roomId }),

  addMessage: (roomId, message) =>
    set((state) => {
      const roomMessages = state.messages.get(roomId) || [];
      // 중복 체크 (같은 ID의 메시지가 이미 있으면 추가하지 않음)
      if (roomMessages.some((m) => m.id === message.id)) {
        return state;
      }
      const newMessages = new Map(state.messages);
      newMessages.set(roomId, [...roomMessages, message]);
      return { messages: newMessages };
    }),

  setMessages: (roomId, messages) =>
    set((state) => {
      const newMessages = new Map(state.messages);
      newMessages.set(roomId, messages);
      return { messages: newMessages };
    }),

  appendMessages: (roomId, newMessages) =>
    set((state) => {
      const existingMessages = state.messages.get(roomId) || [];
      const combined = [...existingMessages, ...newMessages];
      // 중복 제거 및 정렬
      const unique = Array.from(
        new Map(combined.map((m) => [m.id, m])).values()
      ).sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
      
      const updated = new Map(state.messages);
      updated.set(roomId, unique);
      return { messages: updated };
    }),

  setOnlineMembers: (roomId, members) =>
    set((state) => {
      const newOnlineMembers = new Map(state.onlineMembers);
      newOnlineMembers.set(roomId, members);
      return { onlineMembers: newOnlineMembers };
    }),

  setConnected: (connected) => set({ isConnected: connected }),

  setLoading: (loading) => set({ isLoading: loading }),

  clearRoom: (roomId) =>
    set((state) => {
      const newMessages = new Map(state.messages);
      newMessages.delete(roomId);
      const newOnlineMembers = new Map(state.onlineMembers);
      newOnlineMembers.delete(roomId);
      return { messages: newMessages, onlineMembers: newOnlineMembers };
    }),

  reset: () =>
    set({
      currentRoomId: null,
      messages: new Map(),
      onlineMembers: new Map(),
      isConnected: false,
      isLoading: false,
    }),
}));
