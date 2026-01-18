import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  Stack,
  Button,
  TextField,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import client from "../api/client";
import TaskDetailDialog from "../components/TaskDetailDialog";

// --- DTO 정의 ---
interface Task {
  taskId: number;
  title: string;
  workerName?: string;
  sequence: number;
}
interface KanbanColumn {
  columnId: number;
  name: string;
  sequence: number;
  tasks: Task[];
}
interface BoardData {
  projectId: number;
  name: string;
  columns: KanbanColumn[];
}

const KanbanBoardPage = () => {
  const { projectId } = useParams();
  const [boardData, setBoardData] = useState<BoardData | null>(null);

  // 업무 생성 관련 State
  const [addingColId, setAddingColId] = useState<number | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // ★ [추가] 컬럼 생성 관련 State
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  const fetchBoard = useCallback(async (): Promise<BoardData> => {
    const response = await client.get(`/projects/${projectId}/board`);
    return response.data as BoardData;
  }, [projectId]);

  const refreshBoard = useCallback(async () => {
    const data = await fetchBoard();
    setBoardData(data);
  }, [fetchBoard]);

  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleCardClick = (taskId: number) => {
    setSelectedTaskId(taskId);
    setIsDetailOpen(true);
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchBoard();
        if (!cancelled) {
          setBoardData(data);
        }
      } catch (error) {
        console.error("보드 데이터 로드 실패:", error);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [fetchBoard]);

  // 업무 생성 함수 (기존 유지)
  const handleCreateTask = async (columnId: number) => {
    if (!newTaskTitle.trim()) return;
    try {
      await client.post(`/columns/${columnId}/tasks`, {
        title: newTaskTitle,
        deadline: new Date().toISOString().split("T")[0],
        sequence: 999,
      });
      setNewTaskTitle("");
      setAddingColId(null);
      await refreshBoard();
    } catch (error) {
      console.error("업무 생성 실패", error);
      alert("업무 생성 중 오류가 발생했습니다.");
    }
  };

  // ★ [추가] 컬럼 생성 함수
  const handleCreateColumn = async () => {
    if (!newColumnTitle.trim()) return;

    try {
      // 백엔드 API: POST /api/projects/{projectId}/columns
      // DTO: ColumnCreateRequestDTO (name, sequence)
      await client.post(`/projects/${projectId}/columns`, {
        name: newColumnTitle,
        sequence: boardData ? boardData.columns.length + 1 : 1, // 맨 뒤에 추가
      });

      setNewColumnTitle("");
      setIsAddingColumn(false);
      await refreshBoard(); // 목록 새로고침
    } catch (error) {
      console.error("컬럼 생성 실패", error);
      alert("컬럼 생성 중 오류가 발생했습니다.");
    }
  };

  // 드래그 앤 드롭 로직 (기존 유지)
  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;
    if (!boardData) return;

    // 낙관적 업데이트
    const newColumns = [...boardData.columns];
    const sourceColIndex = newColumns.findIndex(
      (col) => col.columnId.toString() === source.droppableId,
    );
    const destColIndex = newColumns.findIndex(
      (col) => col.columnId.toString() === destination.droppableId,
    );

    const sourceCol = newColumns[sourceColIndex];
    const destCol = newColumns[destColIndex];

    const [movedTask] = sourceCol.tasks.splice(source.index, 1);
    destCol.tasks.splice(destination.index, 0, movedTask);

    setBoardData({ ...boardData, columns: newColumns });

    // API 호출
    try {
      await client.put(`/tasks/${draggableId}/move`, {
        targetColumnId: Number(destination.droppableId),
        newSequence: destination.index + 1,
      });
    } catch (error) {
      console.error("이동 저장 실패", error);
      await refreshBoard();
    }
  };

  if (!boardData) return <Typography sx={{ p: 4 }}>로딩 중...</Typography>;

  return (
    <Box
      sx={{
        height: "100vh",
        p: 2,
        backgroundColor: "#f4f5f7",
        overflowX: "auto",
      }}
    >
      <Typography
        variant="h5"
        fontWeight="bold"
        mb={3}
        sx={{ color: "#172b4d" }}
      >
        {boardData.name}
      </Typography>

      <DragDropContext onDragEnd={onDragEnd}>
        {/* Stack 안에 컬럼들과 '컬럼 추가 버튼'을 나란히 배치 */}
        <Stack direction="row" spacing={2} alignItems="flex-start">
          {/* 1. 기존 컬럼들 렌더링 */}
          {boardData.columns.map((column) => (
            <Paper
              key={column.columnId}
              sx={{
                minWidth: 300,
                width: 300,
                p: 1.5,
                backgroundColor: "#ebecf0",
                borderRadius: 2,
                maxHeight: "85vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                mb={2}
                sx={{ px: 1 }}
              >
                {column.name}{" "}
                <Chip
                  label={column.tasks.length}
                  size="small"
                  sx={{ ml: 1, height: 20 }}
                />
              </Typography>

              <Droppable droppableId={column.columnId.toString()}>
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      flexGrow: 1,
                      minHeight: 10,
                      overflowY: "auto",
                      px: 0.5,
                    }}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable
                        key={task.taskId}
                        draggableId={task.taskId.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => handleCardClick(task.taskId)}
                            sx={{
                              mb: 1,
                              cursor: "grab",
                              transform: snapshot.isDragging
                                ? "rotate(2deg)"
                                : "none",
                              boxShadow: snapshot.isDragging ? 4 : 1,
                              "&:hover": { bgcolor: "#f8f9fa" },
                            }}
                          >
                            <CardContent sx={{ p: "12px !important" }}>
                              <Typography variant="body2" fontWeight="500">
                                {task.title}
                              </Typography>
                              {task.workerName && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                  mt={0.5}
                                >
                                  {task.workerName}
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>

              {/* 업무 추가 영역 */}
              <Box sx={{ mt: 1 }}>
                {addingColId === column.columnId ? (
                  <Box sx={{ p: 1 }}>
                    <TextField
                      autoFocus
                      fullWidth
                      size="small"
                      placeholder="업무 제목"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleCreateTask(column.columnId)
                      }
                      sx={{ bgcolor: "white", mb: 1 }}
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleCreateTask(column.columnId)}
                      >
                        추가
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setAddingColId(null);
                          setNewTaskTitle("");
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
                ) : (
                  <Button
                    startIcon={<AddIcon />}
                    fullWidth
                    sx={{
                      justifyContent: "flex-start",
                      color: "#5e6c84",
                      "&:hover": { bgcolor: "rgba(9, 30, 66, 0.08)" },
                    }}
                    onClick={() => {
                      setAddingColId(column.columnId);
                      setNewTaskTitle("");
                    }}
                  >
                    카드 추가
                  </Button>
                )}
              </Box>
            </Paper>
          ))}

          {/* ★ [추가] 2. 맨 오른쪽: 리스트(컬럼) 추가 버튼 영역 */}
          <Box sx={{ minWidth: 300, width: 300 }}>
            {isAddingColumn ? (
              <Paper
                sx={{ p: 1.5, backgroundColor: "#ebecf0", borderRadius: 2 }}
              >
                <TextField
                  autoFocus
                  fullWidth
                  size="small"
                  placeholder="리스트 이름 입력"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateColumn()}
                  sx={{ bgcolor: "white", mb: 1 }}
                />
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" onClick={handleCreateColumn}>
                    리스트 추가
                  </Button>
                  <IconButton
                    onClick={() => {
                      setIsAddingColumn(false);
                      setNewColumnTitle("");
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Stack>
              </Paper>
            ) : (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                fullWidth
                sx={{
                  justifyContent: "flex-start",
                  backgroundColor: "rgba(255,255,255,0.24)",
                  color: "black", // 배경색에 따라 가독성 조정 필요
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.32)" },
                  height: "fit-content",
                  py: 1.5,
                }}
                onClick={() => setIsAddingColumn(true)}
              >
                리스트 추가
              </Button>
            )}
          </Box>
          {/* ★ 화면 최하단에 모달 컴포넌트 */}
          <TaskDetailDialog
            open={isDetailOpen}
            taskId={selectedTaskId}
            onClose={() => setIsDetailOpen(false)}
            onUpdate={refreshBoard} // 수정/삭제 시 목록 새로고침
          />
        </Stack>
      </DragDropContext>
    </Box>
  );
};

export default KanbanBoardPage;
