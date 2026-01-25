import { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";

// 1. 주고받을 메시지 타입 정의 (DTO와 일치시킴)
interface ChatMessage {
  roomId: number;
  sender: string;
  content: string;
}

const ChatTest = () => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  // useState 초기화 함수로 랜덤 닉네임 생성 (한 번만 실행)
  const [myName] = useState(() => "테스터" + Math.floor(Math.random() * 100));

  // 2. STOMP 클라이언트 객체를 Ref로 관리 (재렌더링 방지)
  const clientRef = useRef<Client | null>(null);

  const roomId = 1; // 테스트용 방 번호

  useEffect(() => {
    // 3. 클라이언트 생성 및 설정 (순수 WebSocket, brokerURL)
    const client = new Client({
      brokerURL: "ws://localhost:8080/ws",
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      // 연결 성공 시 실행될 콜백
      onConnect: () => {
        console.log("Connected to WebSocket!");
        setConnected(true);

        // 4. 구독 (Subscribe): /sub/chat/room/{roomId}
        client.subscribe(`/sub/chat/room/${roomId}`, (message) => {
          if (message.body) {
            const parsedMessage: ChatMessage = JSON.parse(message.body);
            // 기존 메시지 목록에 새 메시지 추가
            setMessages((prev) => [...prev, parsedMessage]);
          }
        });
      },

      // 연결 해제 시 실행될 콜백
      onDisconnect: () => {
        console.log("Disconnected");
        setConnected(false);
      },

      // 에러 로깅
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
      },
    });

    // 5. 클라이언트 활성화 (연결 시작)
    client.activate();
    clientRef.current = client;

    // 컴포넌트 언마운트 시 연결 끊기
    return () => {
      client.deactivate();
    };
  }, []);

  // 6. 메시지 전송 함수 (Publish)
  const sendMessage = () => {
    if (clientRef.current && clientRef.current.connected && input.trim()) {
      const chatMessage: ChatMessage = {
        roomId: roomId,
        sender: myName,
        content: input,
      };

      // /pub/chat/message 로 전송
      clientRef.current.publish({
        destination: "/pub/chat/message",
        body: JSON.stringify(chatMessage),
      });

      setInput(""); // 입력창 비우기
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "600px",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>💬 BizSync Realtime Chat Test</h2>

      {/* 연결 상태 표시 */}
      <div style={{ marginBottom: "10px" }}>
        Status:{" "}
        <span
          style={{ color: connected ? "green" : "red", fontWeight: "bold" }}
        >
          {connected ? "CONNECTED (Online)" : "DISCONNECTED"}
        </span>
        <br />
        My Name: <strong>{myName}</strong>
      </div>

      {/* 채팅 내역 영역 */}
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          height: "300px",
          overflowY: "scroll",
          padding: "10px",
          marginBottom: "10px",
          backgroundColor: "#f9f9f9",
        }}
      >
        {messages.length === 0 ? (
          <p style={{ color: "#888", textAlign: "center" }}>
            메시지가 없습니다.
          </p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} style={{ marginBottom: "8px" }}>
              <strong>{msg.sender}:</strong> {msg.content}
            </div>
          ))
        )}
      </div>

      {/* 입력 영역 */}
      <div style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요..."
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ddd",
          }}
          disabled={!connected}
        />
        <button
          onClick={sendMessage}
          disabled={!connected}
          style={{
            padding: "10px 20px",
            backgroundColor: connected ? "#007bff" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: connected ? "pointer" : "not-allowed",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatTest;
