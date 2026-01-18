import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";

/**
 * [WebSocket Hook]
 * 특정 프로젝트의 변경 사항을 실시간으로 구독합니다.
 * @param projectId 구독할 프로젝트 ID
 * @param onUpdate 변경 사항 발생 시 실행할 콜백 함수 (주로 데이터 새로고침)
 */
export const useBoardSocket = (
  projectId: string | undefined,
  onUpdate: () => void,
) => {
  // WebSocket Client 객체를 ref로 관리 (렌더링과 무관하게 유지)
  const client = useRef<Client | null>(null);

  useEffect(() => {
    if (!projectId) return;

    // 1. 클라이언트 설정
    client.current = new Client({
      brokerURL: "ws://localhost:8080/ws", // 백엔드 주소 (ws 프로토콜)
      reconnectDelay: 5000, // 연결 끊기면 5초 뒤 재시도
      onConnect: () => {
        console.log(`Connected to Project ${projectId}`);

        // 2. 구독 (Subscribe): /topic/projects/{projectId}
        client.current?.subscribe(`/topic/projects/${projectId}`, (message) => {
          if (message.body === "BOARD_UPDATE") {
            console.log("Real-time update received!");
            onUpdate(); // 부모 컴포넌트의 데이터 새로고침 함수 실행
          }
        });
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
      },
    });

    // 3. 활성화
    client.current.activate();

    // 4. Cleanup: 컴포넌트 언마운트 시 연결 종료
    return () => {
      console.log("Disconnecting...");
      client.current?.deactivate();
    };
  }, [projectId, onUpdate]); // projectId가 바뀌면 재연결
};
