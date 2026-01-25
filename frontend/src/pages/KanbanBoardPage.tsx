import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ColumnCreateDialog from "../components/ColumnCreateDialog";
import ProjectInviteDialog from "../components/ProjectInviteDialog";
import ProjectSettingsDialog from "../components/ProjectSettingsDialog";
import TaskCreateDialog from "../components/TaskCreateDialog";
import TaskDetailDialog from "../components/TaskDetailDialog";
import { useBoardSocket } from "../hooks/useBoardSocket";
import { useKanbanBoard } from "../hooks/useKanbanBoard";
import type { TaskCreateData } from "../types/kanban";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ReplayIcon from "@mui/icons-material/Replay";
import SettingsIcon from "@mui/icons-material/Settings";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import client from "../api/client";
import { projectApi } from "../api/project";

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

  const getDaysUntilDeadline = (deadline?: string): number | null => {
    if (!deadline) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isDeadlineNear = (deadline?: string): boolean => {
    const daysLeft = getDaysUntilDeadline(deadline);
    return daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;
  };

  const [isColumnCreateOpen, setIsColumnCreateOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createColId, setCreateColId] = useState<number | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [completingProject, setCompletingProject] = useState(false);

  useBoardSocket(projectId, refreshBoard);

  // 프로젝트 완료 처리
  const handleCompleteProject = async () => {
    if (!projectId) return;
    try {
      setCompletingProject(true);
      await client.patch(`/projects/${projectId}/complete`);
      setSnackbarMessage("프로젝트가 완료되었습니다.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      refreshBoard(); // 보드 새로고침
    } catch (error) {
      console.error("프로젝트 완료 실패:", error);
      setSnackbarMessage("프로젝트 완료에 실패했습니다.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setCompletingProject(false);
    }
  };

  // 프로젝트 진행 처리 (기획중 -> 진행중)
  const handleStartProject = async () => {
    if (!projectId) return;
    try {
      setCompletingProject(true);
      await projectApi.startProject(projectId);
      setSnackbarMessage("프로젝트가 진행되었습니다.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      refreshBoard(); // 보드 새로고침
    } catch (error) {
      console.error("프로젝트 진행 실패:", error);
      setSnackbarMessage("프로젝트 진행에 실패했습니다.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setCompletingProject(false);
    }
  };

  // 프로젝트 재진행 처리
  const handleReopenProject = async () => {
    if (!projectId) return;
    try {
      setCompletingProject(true);
      await client.patch(`/projects/${projectId}/reopen`);
      setSnackbarMessage("프로젝트를 재진행합니다.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      refreshBoard(); // 보드 새로고침
    } catch (error) {
      console.error("프로젝트 재진행 실패:", error);
      setSnackbarMessage("프로젝트 재진행에 실패했습니다.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setCompletingProject(false);
    }
  };

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

  const onColumnCreateSubmit = async (data: { name: string; description?: string; columnType?: string }) => {
    await createColumn(data);
    setIsColumnCreateOpen(false);
  };

  const handleCardClick = (taskId: number) => {
    setSelectedTaskId(taskId);
    setIsDetailOpen(true);
  };

  // [컬럼 삭제]
  const handleDeleteColumn = async (columnId: number, columnName: string) => {
    if (!confirm(`"${columnName}" 컬럼을 삭제하시겠습니까?\n컬럼 내 모든 업무도 함께 삭제됩니다.`)) {
      return;
    }

    try {
      await client.delete(`/columns/${columnId}`);
      setSnackbarMessage("컬럼이 삭제되었습니다");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      await refreshBoard();
    } catch (error: any) {
      console.error("컬럼 삭제 실패:", error);
      setSnackbarMessage(error.response?.data?.message || "컬럼 삭제에 실패했습니다");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // [엑셀 업로드] 파일 선택 다이얼로그 열기
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // [엑셀 업로드] 파일 선택 후 업로드 처리
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !projectId) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await client.post(`/projects/${projectId}/excel`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // 성공 메시지 표시
      const count = response.data?.count || 0;
      setSnackbarMessage(`${count}개의 업무가 등록되었습니다`);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      // 보드 새로고침
      await refreshBoard();
    } catch (error: any) {
      console.error("엑셀 업로드 실패:", error);
      setSnackbarMessage(error.response?.data?.message || "엑셀 업로드에 실패했습니다");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setUploading(false);
      // input 초기화 (같은 파일 재선택 가능하도록)
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // [엑셀 다운로드] 파일 다운로드 처리
  const handleDownload = async () => {
    if (!projectId) return;

    setDownloading(true);
    try {
      const response = await client.get(`/projects/${projectId}/excel`, {
        responseType: "blob",
      });

      // Blob을 파일로 다운로드
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${boardData?.name || "kanban"}_tasks.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSnackbarMessage("엑셀 파일이 다운로드되었습니다");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error("엑셀 다운로드 실패:", error);
      setSnackbarMessage(error.response?.data?.message || "엑셀 다운로드에 실패했습니다");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setDownloading(false);
    }
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
      {/* ★ 헤더 영역 수정: 제목과 버튼들을 양옆으로 배치 */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={{ xs: 2, sm: 0 }}
        mb={3}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              color: "#172b4d",
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
            }}
          >
            {boardData.name}
          </Typography>
          {(boardData.startDate || boardData.endDate) && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              기간 : {boardData.startDate || "-"} ~ {boardData.endDate || "-"}
            </Typography>
          )}
          <Box sx={{ mt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              총 예산 : {boardData.totalBudget != null ? Number(boardData.totalBudget).toLocaleString() : "0"}원
            </Typography>
            <Typography variant="body2" color="text.secondary">
              사용 예산 : {boardData.usedBudget != null ? Number(boardData.usedBudget).toLocaleString() : "0"}원
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
          {/* 엑셀 업로드 버튼 */}
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={uploading ? <CircularProgress size={16} /> : <UploadFileIcon />}
            onClick={handleUploadClick}
            disabled={uploading}
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            }}
          >
            {uploading ? "업로드 중..." : "엑셀 업로드"}
          </Button>

          {/* 엑셀 다운로드 버튼 */}
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={downloading ? <CircularProgress size={16} /> : <DownloadIcon />}
            onClick={handleDownload}
            disabled={downloading}
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            }}
          >
            {downloading ? "다운로드 중..." : "엑셀 다운로드"}
          </Button>

          {/* 프로젝트 진행/완료/재진행 버튼 (PL만) */}
          {boardData?.myRole === "PL" && (
            <>
              {boardData?.status === "PLANNING" ? (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={completingProject ? <CircularProgress size={16} /> : <PlayArrowIcon />}
                  onClick={handleStartProject}
                  disabled={completingProject}
                  sx={{
                    fontWeight: "bold",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  {completingProject ? "처리 중..." : "프로젝트 진행"}
                </Button>
              ) : boardData?.status === "COMPLETED" ? (
                <Button
                  variant="outlined"
                  color="success"
                  size="small"
                  startIcon={completingProject ? <CircularProgress size={16} /> : <ReplayIcon />}
                  onClick={handleReopenProject}
                  disabled={completingProject}
                  sx={{
                    fontWeight: "bold",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  {completingProject ? "처리 중..." : "재진행"}
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="success"
                  size="small"
                  startIcon={completingProject ? <CircularProgress size={16} /> : <CheckCircleIcon />}
                  onClick={handleCompleteProject}
                  disabled={completingProject || boardData?.status === "COMPLETED"}
                  sx={{
                    fontWeight: "bold",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  {completingProject ? "처리 중..." : "프로젝트 완료"}
                </Button>
              )}
            </>
          )}

          {/* 팀원 초대 버튼 */}
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<PersonAddIcon />}
            onClick={() => setIsInviteOpen(true)}
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            }}
          >
            팀원 초대
          </Button>

          <Button
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<SettingsIcon />}
            onClick={() => setIsSettingsOpen(true)}
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            }}
          >
            설정
          </Button>
        </Stack>
      </Stack>

      {/* 숨겨진 파일 input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

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
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={2}
                sx={{ px: 1 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {column.name}
                  </Typography>
                  <Chip
                    label={column.tasks.length}
                    size="small"
                    sx={{ height: 20 }}
                  />
                  {column.columnType && (
                    <Chip
                      label={
                        column.columnType === "TODO"
                          ? "할 일"
                          : column.columnType === "IN_PROGRESS"
                            ? "진행 중"
                            : "완료"
                      }
                      size="small"
                      color={
                        column.columnType === "TODO"
                          ? "default"
                          : column.columnType === "IN_PROGRESS"
                            ? "primary"
                            : "success"
                      }
                      sx={{ height: 20, fontSize: "0.7rem" }}
                    />
                  )}
                </Box>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteColumn(column.columnId, column.name)}
                  sx={{
                    color: "error.main",
                    "&:hover": { bgcolor: "error.light" },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
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
                    {column.tasks.length === 0 ? (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          minHeight: 100,
                          color: "text.secondary",
                        }}
                      >
                        <Typography variant="caption">
                          업무가 없습니다
                        </Typography>
                      </Box>
                    ) : (
                      column.tasks.map((task, index) => (
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
                                {task.deadline && (
                                  <Typography
                                    variant="caption"
                                    display="block"
                                    mt={0.5}
                                    sx={{
                                      color: isDeadlineNear(task.deadline) ? "error.main" : "text.secondary",
                                      fontWeight: isDeadlineNear(task.deadline) ? "bold" : "normal",
                                    }}
                                  >
                                    {(() => {
                                      const daysLeft = getDaysUntilDeadline(task.deadline);
                                      if (daysLeft === null) return "";
                                      if (daysLeft < 0) return `기한 초과 (${Math.abs(daysLeft)}일)`;
                                      if (daysLeft === 0) return "⚠️ 오늘 마감";
                                      if (daysLeft <= 3) return `⚠️ D-${daysLeft}`;
                                      return `마감: ${task.deadline}`;
                                    })()}
                                  </Typography>
                                )}
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>

              {/* 카드 추가 버튼 */}
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
            </Paper>
          ))}

          {/* 리스트(컬럼) 추가 버튼 */}
          <Box sx={{ minWidth: 300, width: 300 }}>
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
              onClick={() => setIsColumnCreateOpen(true)}
            >
              리스트 추가
            </Button>
          </Box>

          {/* 컬럼 생성 모달 */}
          <ColumnCreateDialog
            open={isColumnCreateOpen}
            onClose={() => setIsColumnCreateOpen(false)}
            onSubmit={onColumnCreateSubmit}
          />

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

          {/* ★ 팀원 초대 모달 추가 */}
          <ProjectInviteDialog
            open={isInviteOpen}
            onClose={() => setIsInviteOpen(false)}
            projectId={projectId}
          />

          {/* 프로젝트 설정 모달 */}
          <ProjectSettingsDialog
            open={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            projectId={projectId}
            onUpdate={refreshBoard}
          />
        </Stack>
      </DragDropContext>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default KanbanBoardPage;
