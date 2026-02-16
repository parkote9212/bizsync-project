'use client';

import { useEffect, useState, useRef } from 'react';

interface Message {
  messageId: number;
  senderId: number;
  senderName: string;
  content: string;
  createdAt: string;
  isOwn: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      // 추후 WebSocket/STOMP 연동
      // const stompClient = connectWebSocket();

      // 임시 데이터
      setTimeout(() => {
        setMessages([
          {
            messageId: 1,
            senderId: 2,
            senderName: '김철수',
            content: '안녕하세요! 프로젝트 진행 상황 공유드립니다.',
            createdAt: '2025-02-15T10:00:00',
            isOwn: false,
          },
          {
            messageId: 2,
            senderId: 1,
            senderName: '나',
            content: '네, 감사합니다. 현재 어느 단계까지 진행되었나요?',
            createdAt: '2025-02-15T10:01:00',
            isOwn: true,
          },
          {
            messageId: 3,
            senderId: 2,
            senderName: '김철수',
            content: 'Next.js 프로젝트 셋업이 완료되었고, 칸반 보드 구현 중입니다.',
            createdAt: '2025-02-15T10:02:00',
            isOwn: false,
          },
          {
            messageId: 4,
            senderId: 3,
            senderName: '이영희',
            content: '좋습니다! 저도 결재 페이지 작업 시작하겠습니다.',
            createdAt: '2025-02-15T10:03:00',
            isOwn: false,
          },
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('메시지 로딩 실패:', error);
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      messageId: messages.length + 1,
      senderId: 1,
      senderName: '나',
      content: inputMessage,
      createdAt: new Date().toISOString(),
      isOwn: true,
    };

    // 추후 WebSocket으로 전송
    // stompClient.send('/app/chat', {}, JSON.stringify(newMessage));

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)]">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">채팅</h1>
        <p className="text-sm text-gray-500">팀원들과 실시간으로 소통하세요</p>
      </div>

      <div className="bg-white border border-gray-200 h-[calc(100%-4.5rem)] flex flex-col">
        {/* 채팅 헤더 */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">BizSync v2 팀</h2>
              <p className="text-xs text-gray-500 tabular-nums">온라인 3명</p>
            </div>
            <div className="flex gap-1">
              <button className="p-1.5 text-gray-600 hover:bg-gray-100 text-sm">
                🔍
              </button>
              <button className="p-1.5 text-gray-600 hover:bg-gray-100 text-sm">
                ⚙️
              </button>
            </div>
          </div>
        </div>

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map((message) => (
            <MessageBubble key={message.messageId} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 메시지 입력 */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 text-gray-600 hover:bg-gray-100 text-sm"
            >
              📎
            </button>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              전송
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  return (
    <div className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-md ${message.isOwn ? 'order-2' : ''}`}>
        {!message.isOwn && (
          <p className="text-xs text-gray-500 mb-1">{message.senderName}</p>
        )}
        <div
          className={`px-3 py-2 ${
            message.isOwn
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-900 border border-gray-200'
          }`}
        >
          <p className="text-sm">{message.content}</p>
        </div>
        <p className="text-xs text-gray-400 mt-1 tabular-nums">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
