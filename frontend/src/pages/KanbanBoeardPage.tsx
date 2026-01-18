import { useState } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
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
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import TaskDetailDialog from "../components/TaskDetailDialog";
import TaskCreateDialog from "../components/TaskCreateDialog";
import { useKanbanBoard } from "../hooks/useKanbanBoard";
import type { TaskCreateData } from "../types/kanban";

const KanbanBoardPage = () => {
  const { projectId } = useParams();

  const {
    boardData,
    loading,
    handleDragEnd,
    createTask,
    createColumn,
    refreshBoard,
  } = useKanbanBoard(projectId);

  // --- State ---

  // 1. 컬럼 추가용 State
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  // 2. 업무 생성 모달용 State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createColId, setCreateColId] = useState<number | null>(null);

  // 3. 업무 상세 모달용 State
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // --- Handlers ---

  // [모달 열기] 카드 추가 버튼 클릭 시
  const openCreateDialog = (columnId: number) => {
    setCreateColId(columnId);
    setIsCreateOpen(true);
  };

  // [생성 완료] 모달에서 '생성' 눌렀을 때
  const handleCreateSubmit = async (data: TaskCreateData) => {
    if (createColId === null) return;
    await createTask(createColId, data);
    setIsCreateOpen(false); // 모달 닫기
  };

  const onColumnCreateSubmit = async () => {
    await createColumn(newColumnTitle);
    setNewColumnTitle("");
    setIsAddingColumn(false);
  };

  const handleCardClick = (taskId: number) => {
    setSelectedTaskId(taskId);
    setIsDetailOpen(true);
  };

  // --- Render ---

  if (loading && !boardData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!boardData)
    return <Typography sx={{ p: 4 }}>데이터를 불러올 수 없습니다.</Typography>;

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

      <DragDropContext onDragEnd={handleDragEnd}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          {/* 컬럼 리스트 */}
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

              {/* ★ 카드 추가 버튼 (모달 열기) */}
              <Box sx={{ mt: 1 }}>
                <Button
                  startIcon={<AddIcon />}
                  fullWidth
                  sx={{
                    justifyContent: "flex-start",
                    color: "#5e6c84",
                    "&:hover": { bgcolor: "rgba(9, 30, 66, 0.08)" },
                  }}
                  onClick={() => openCreateDialog(column.columnId)}
                >
                  카드 추가
                </Button>
              </Box>

              {/* 여기에 있던 잘못된 onClick 코드와 중복 Box 삭제함 */}
            </Paper>
          ))}

          {/* 리스트(컬럼) 추가 버튼 */}
          <Box sx={{ minWidth: 300, width: 300 }}>
            {isAddingColumn ? (
              <Paper
                sx={{ p: 1.5, backgroundColor: "#ebecf0", borderRadius: 2 }}
              >
                <TextField
                  autoFocus
                  fullWidth
                  size="small"
                  placeholder="리스트 이름"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onColumnCreateSubmit()}
                  sx={{ bgcolor: "white", mb: 1 }}
                />
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" onClick={onColumnCreateSubmit}>
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
                  color: "black",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.32)" },
                  py: 1.5,
                }}
                onClick={() => setIsAddingColumn(true)}
              >
                리스트 추가
              </Button>
            )}
          </Box>

          {/* 업무 생성 모달 */}
          <TaskCreateDialog
            open={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onSubmit={handleCreateSubmit}
          />

          {/* 업무 상세 모달 */}
          <TaskDetailDialog
            open={isDetailOpen}
            taskId={selectedTaskId}
            onClose={() => setIsDetailOpen(false)}
            onUpdate={refreshBoard}
          />
        </Stack>
      </DragDropContext>
    </Box>
  );
};

export default KanbanBoardPage;
