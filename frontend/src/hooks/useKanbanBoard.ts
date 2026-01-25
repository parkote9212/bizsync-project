import type { DropResult } from "@hello-pangea/dnd";
import { useCallback, useEffect, useState } from "react";
import client from "../api/client";
import type { BoardData, TaskCreateData } from "../types/kanban";

/**
 * [Service Layer] 칸반 보드의 비즈니스 로직을 담당하는 커스텀 훅
 * @param projectId 프로젝트 식별자
 */
export const useKanbanBoard = (projectId: string | undefined) => {
  // 전역 상태가 아닌, 해당 보드 페이지 내에서 관리할 로컬 상태 (State = 인메모리 데이터)
  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * [READ] 보드 데이터 조회 (SELECT)
   * useCallback: 의존성(projectId)이 변하지 않으면 함수 객체를 재사용 (불필요한 리렌더링 방지)
   */
  const fetchBoard = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const response = await client.get(`/projects/${projectId}/board`);
      setBoardData(response.data); // 성공 시 상태 업데이트
    } catch (error) {
      console.error("보드 로드 실패:", error);
    } finally {
      setLoading(false); // 비동기 작업 종료 후 로딩 해제 (finally 블록 활용)
    }
  }, [projectId]);

  /**
   * [Lifecycle] 컴포넌트 마운트 시 최초 1회 실행 (Spring의 @PostConstruct와 유사한 시점)
   */
  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  /**
   * [UPDATE] 드래그 앤 드롭 핸들러 (Task 위치 변경)
   * 사용자 경험을 위해 '낙관적 업데이트(Optimistic Update)' 패턴을 적용함
   */
  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // 1. 유효성 검사 (Validation): 유효하지 않은 영역에 놓았거나 제자리에 놓은 경우 무시
    if (!destination || !boardData) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    // --- [Step 2] 낙관적 업데이트 수행 (UI 선반영) ---
    // 불변성을 지키기 위해 스프레드 연산자(...)로 깊은 복사 수행
    const newColumns = [...boardData.columns];

    // 이동 전(Source) 컬럼과 이동 후(Destination) 컬럼 인덱스 찾기
    const sourceColIndex = newColumns.findIndex(
      (col) => col.columnId.toString() === source.droppableId,
    );
    const destColIndex = newColumns.findIndex(
      (col) => col.columnId.toString() === destination.droppableId,
    );

    const sourceCol = newColumns[sourceColIndex];
    const destCol = newColumns[destColIndex];

    // 기존 컬럼 배열에서 데이터 제거 (Splice) 후 목적지 컬럼에 삽입
    const [movedTask] = sourceCol.tasks.splice(source.index, 1);
    destCol.tasks.splice(destination.index, 0, movedTask);

    // 실제 서버 응답이 오기 전, 메모리상의 상태(State)를 먼저 변경하여 사용자에게 즉각적 피드백 제공
    setBoardData({ ...boardData, columns: newColumns });

    // --- [Step 3] API 호출 (Persistence Layer 반영) ---
    try {
      await client.put(`/tasks/${draggableId}/move`, {
        targetColumnId: Number(destination.droppableId),
        newSequence: destination.index + 1, // 백엔드의 1-based 인덱스 정책 반영
      });
    } catch (error) {
      console.error("이동 저장 실패", error);
      // 트랜잭션 실패 시: 롤백(Rollback) 수행 - 서버 데이터를 다시 불러와서 UI 원복
      fetchBoard();
    }
  };

  /**
   * [CREATE] 업무 생성 (INSERT)
   */
  const createTask = async (columnId: number, data: TaskCreateData) => {
    if (!data.title.trim()) return;

    try {
      await client.post(`/columns/${columnId}/tasks`, {
        ...data, // title, description, deadline, workerId 모두 포함
        sequence: 999,
      });
      await fetchBoard();
    } catch (error) {
      console.error("업무 생성 실패", error);
      alert("업무 생성 실패");
    }
  };

  /**
   * [CREATE] 컬럼 생성 (INSERT)
   */
  const createColumn = async (data: { name: string; description?: string; columnType?: string }) => {
    if (!data.name.trim() || !projectId) return;
    try {
      await client.post(`/projects/${projectId}/columns`, {
        name: data.name,
        description: data.description,
        columnType: data.columnType,
      });
      await fetchBoard();
    } catch (error: unknown) {
      console.error("컬럼 생성 실패", error);
      const axiosError = error as { response?: { data?: { message?: string }; status?: number } };
      const errorMessage = axiosError.response?.data?.message || "컬럼 생성에 실패했습니다.";
      alert(errorMessage);
    }
  };

  // UI 컴포넌트에서 필요한 '로직'과 '데이터'만 선별하여 반환 (Interface 제공)
  return {
    boardData,
    loading,
    refreshBoard: fetchBoard,
    handleDragEnd,
    createTask,
    createColumn,
  };
};
