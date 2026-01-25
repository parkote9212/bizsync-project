import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  AvatarGroup,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import { useChatStore } from "../stores/chatStore";
import { useChatSocket } from "../hooks/useChatSocket";
import { useUserStore } from "../stores/userStore";
import client from "../api/client";
import type { ChatHistoryResponse } from "../types/chat";
/**
 * 날짜를 상대 시간 문자열로 변환 (예: "2분 전", "1시간 전")
 */
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * 채팅 패널 Props
 */
interface ChatPanelProps {
  /** 채팅방 ID (프로젝트 ID) */
  roomId: number;
  /** 패널 닫기 콜백 */
  onClose: () => void;
}

/**
 * 채팅 패널 컴포넌트
 *
 * <p>프로젝트별 실시간 채팅을 제공하는 사이드 패널입니다.
 * 메시지 전송, 수신, 온라인 멤버 표시 기능을 제공합니다.
 *
 * @component
 * @param {ChatPanelProps} props - ChatPanel 컴포넌트 props
 * @returns {JSX.Element} 채팅 패널
 */
export const ChatPanel: React.FC<ChatPanelProps> = ({ roomId, onClose }) => {
  const { 
    messages, 
    onlineMembers, 
    setMessages,
    setLoading,
    isLoading 
  } = useChatStore();
  const user = useUserStore((state) => state.user);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const oldestCursorRef = useRef<string | null>(null);

  const { sendMessage, isConnected: socketConnected } = useChatSocket(roomId);

  // 메시지 목록 로드 (최초 로딩)
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const response = await client.get(`/chat/room/${roomId}/messages`, {
          params: { limit: 50 },
        });
        const historyResponse: ChatHistoryResponse = response.data;
        setMessages(roomId, historyResponse.messages);
        setHasMore(historyResponse.hasMore);
        oldestCursorRef.current = historyResponse.oldestCursor;
      } catch (error) {
        console.error("Failed to load chat messages:", error);
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      loadMessages();
    }
  }, [roomId, setMessages, setLoading]);

  // 새 메시지가 추가되면 스크롤을 맨 아래로
  useEffect(() => {
    scrollToBottom();
  }, [messages.get(roomId)]);

  // 스크롤을 맨 아래로 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 이전 메시지 로드 (스크롤 위로 올릴 때)
  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore || !oldestCursorRef.current) return;

    try {
      setIsLoadingMore(true);
      
      // 스크롤 위치 저장 (이전 메시지 로드 후 위치 유지용)
      const container = messagesContainerRef.current;
      const previousScrollHeight = container?.scrollHeight || 0;
      const previousScrollTop = container?.scrollTop || 0;
      
      const response = await client.get(`/chat/room/${roomId}/messages`, {
        params: { before: oldestCursorRef.current, limit: 20 },
      });
      const historyResponse: ChatHistoryResponse = response.data;
      
      if (historyResponse.messages.length === 0) {
        setHasMore(false);
        return;
      }

      // 이전 메시지를 기존 메시지 앞에 추가 (오래된 것부터)
      const currentMessages = messages.get(roomId) || [];
      const updatedMessages = [...historyResponse.messages, ...currentMessages];
      setMessages(roomId, updatedMessages);
      
      setHasMore(historyResponse.hasMore);
      oldestCursorRef.current = historyResponse.oldestCursor;
      
      // 스크롤 위치 복원 (새 메시지가 추가된 후)
      setTimeout(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight;
          const scrollDifference = newScrollHeight - previousScrollHeight;
          container.scrollTop = previousScrollTop + scrollDifference;
        }
      }, 0);
    } catch (error) {
      console.error("Failed to load more messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // 스크롤 이벤트 핸들러
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    // 스크롤이 맨 위에 가까우면 이전 메시지 로드
    if (container.scrollTop < 100 && hasMore && !isLoadingMore) {
      loadMoreMessages();
    }
  };

  // 메시지 전송
  const handleSendMessage = () => {
    if (!inputMessage.trim() || !socketConnected) return;
    
    sendMessage(inputMessage);
    setInputMessage("");
  };

  // Enter 키로 메시지 전송
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const roomMessages = messages.get(roomId) || [];
  const roomOnlineMembers = onlineMembers.get(roomId) || [];

  return (
    <Paper
      elevation={3}
      sx={{
        width: 400,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* 헤더 섹션 */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          채팅
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* 온라인 멤버 섹션 */}
      {roomOnlineMembers.length > 0 && (
        <Box sx={{ p: 1.5, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
            온라인 ({roomOnlineMembers.filter((m) => m.isOnline).length})
          </Typography>
          <AvatarGroup max={5} sx={{ justifyContent: "flex-start" }}>
            {roomOnlineMembers
              .filter((m) => m.isOnline)
              .map((member) => (
                <Tooltip key={member.userId} title={member.name}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: "primary.main",
                      border: "2px solid",
                      borderColor: "success.main",
                    }}
                  >
                    {member.name.charAt(0)}
                  </Avatar>
                </Tooltip>
              ))}
          </AvatarGroup>
        </Box>
      )}

      {/* 메시지 목록 섹션 */}
      <Box
        ref={messagesContainerRef}
        onScroll={handleScroll}
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {isLoading && roomMessages.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
            <CircularProgress size={24} />
          </Box>
        ) : roomMessages.length === 0 ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flex={1}
            color="text.secondary"
          >
            <Typography variant="body2">메시지가 없습니다.</Typography>
          </Box>
        ) : (
          <>
            {isLoadingMore && (
              <Box display="flex" justifyContent="center" py={1}>
                <CircularProgress size={20} />
              </Box>
            )}
            {roomMessages.map((message) => {
              const isMyMessage = message.senderId === user.userId;
              return (
                <Box
                  key={message.id}
                  sx={{
                    display: "flex",
                    justifyContent: isMyMessage ? "flex-end" : "flex-start",
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: "70%",
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: isMyMessage ? "primary.main" : "grey.200",
                      color: isMyMessage ? "white" : "text.primary",
                    }}
                  >
                    {!isMyMessage && (
                      <Typography variant="caption" fontWeight="bold" display="block" mb={0.5}>
                        {message.senderName}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                      {message.content}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 0.5,
                        opacity: 0.7,
                        fontSize: "0.7rem",
                      }}
                    >
                      {formatRelativeTime(new Date(message.sentAt))}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* 연결 상태 표시 */}
      <Box sx={{ px: 2, py: 0.5, borderTop: 1, borderColor: "divider" }}>
        <Typography
          variant="caption"
          color={socketConnected ? "success.main" : "error.main"}
          sx={{ fontSize: "0.7rem" }}
        >
          {socketConnected ? "● 연결됨" : "○ 연결 끊김"}
        </Typography>
      </Box>

      {/* 입력 섹션 */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: "divider",
          display: "flex",
          gap: 1,
          alignItems: "flex-end",
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="메시지를 입력하세요..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!socketConnected}
          size="small"
        />
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={!socketConnected || !inputMessage.trim()}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};
