import ApprovalIcon from "@mui/icons-material/Approval";
import AssignmentIcon from "@mui/icons-material/Assignment";
import FolderIcon from "@mui/icons-material/Folder";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import client from "../api/client";

interface MyTask {
  taskId: number;
  title: string;
  projectName: string;
  columnName: string;
  dueDate: string | null;
  daysLeft: number | null;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [projectCount, setProjectCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
  const [myTasks, setMyTasks] = useState<MyTask[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const statsResponse = await client.get("/dashboard/stats");

        if (statsResponse.data) {
          const stats = statsResponse.data;
          setProjectCount(stats.projectCount || 0);
          setTaskCount(stats.taskCount || 0);
          setPendingApprovalCount(stats.pendingApprovalCount || 0);
        } else {
          console.warn("예상치 못한 응답 형식:", statsResponse.data);
          setProjectCount(0);
          setTaskCount(0);
          setPendingApprovalCount(0);
        }

        try {
          const tasksResponse = await client.get("/dashboard/my-tasks");
          if (tasksResponse.data) {
            const tasks = tasksResponse.data;
            const sortedTasks = tasks.sort((a: MyTask, b: MyTask) => {
              if (a.daysLeft === null) return 1;
              if (b.daysLeft === null) return -1;
              return a.daysLeft - b.daysLeft;
            });
            setMyTasks(sortedTasks);
          }
        } catch (taskError) {
          console.warn("내 업무 목록 로드 실패:", taskError);
          setMyTasks([]);
        }
      } catch (error) {
        console.error("대시보드 데이터 로드 실패:", error);
        setProjectCount(0);
        setTaskCount(0);
        setPendingApprovalCount(0);
        setMyTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [location.key]);

  const handleProjectCardClick = () => {
    navigate("/projects");
  };

  const handleTaskCardClick = () => {
    console.log("업무 페이지는 아직 구현되지 않았습니다.");
  };

  const handleApprovalCardClick = () => {
    navigate("/approvals");
  };

  const getDueDateColor = (daysLeft: number | null) => {
    if (daysLeft === null) return "default";
    if (daysLeft < 0) return "error";
    if (daysLeft <= 3) return "error";
    if (daysLeft <= 7) return "warning";
    return "success";
  };

  const getDueDateText = (daysLeft: number | null, dueDate: string | null) => {
    if (!dueDate) return "마감일 없음";
    if (daysLeft === null) return dueDate;
    if (daysLeft < 0) return `${Math.abs(daysLeft)}일 지남`;
    if (daysLeft === 0) return "오늘 마감";
    return `${daysLeft}일 남음`;
  };

  const renderSkeletonCard = () => (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={1}>
          <Skeleton variant="circular" width={32} height={32} sx={{ mr: 1 }} />
          <Skeleton variant="text" width={120} height={32} />
        </Box>
        <Skeleton variant="text" width={80} height={48} />
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          {loading ? (
            renderSkeletonCard()
          ) : (
            <Card
              elevation={2}
              sx={{ cursor: "pointer", "&:hover": { boxShadow: 4 } }}
              onClick={handleProjectCardClick}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <FolderIcon sx={{ mr: 1, fontSize: 32, color: "#1976d2" }} />
                  <Typography variant="h6" color="text.secondary">
                    진행 중인 프로젝트
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" sx={{ color: "#1976d2" }}>
                  {projectCount}개
                </Typography>
                <Typography variant="caption" color="text.secondary" mt={1} display="block">
                  클릭하여 프로젝트 목록 보기
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          {loading ? (
            renderSkeletonCard()
          ) : (
            <Card
              elevation={2}
              sx={{ cursor: "pointer", "&:hover": { boxShadow: 4 } }}
              onClick={handleTaskCardClick}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <AssignmentIcon sx={{ mr: 1, fontSize: 32, color: "#ff9800" }} />
                  <Typography variant="h6" color="text.secondary">
                    내가 진행 중인 업무
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" sx={{ color: "#ff9800" }}>
                  {taskCount}개
                </Typography>
                <Typography variant="caption" color="text.secondary" mt={1} display="block">
                  클릭하여 업무 보기
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          {loading ? (
            renderSkeletonCard()
          ) : (
            <Card
              elevation={2}
              sx={{ cursor: "pointer", "&:hover": { boxShadow: 4 } }}
              onClick={handleApprovalCardClick}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <ApprovalIcon sx={{ mr: 1, fontSize: 32, color: "#f44336" }} />
                  <Typography variant="h6" color="text.secondary">
                    대기 중인 결재
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" sx={{ color: "#f44336" }}>
                  {pendingApprovalCount}건
                </Typography>
                <Typography variant="caption" color="text.secondary" mt={1} display="block">
                  클릭하여 결재함 보기
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      <Paper elevation={2} sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          내 업무 리스트
        </Typography>
        {loading ? (
          <Box>
            <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={60} />
          </Box>
        ) : myTasks.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200,
              bgcolor: "background.default",
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              진행 중인 업무가 없습니다
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>업무명</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>프로젝트</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>상태</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>마감일</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>남은 기간</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {myTasks.map((task) => (
                  <TableRow
                    key={task.taskId}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => {
                      console.log("업무 상세 이동:", task.taskId);
                    }}
                  >
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{task.projectName}</TableCell>
                    <TableCell>
                      <Chip label={task.columnName} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>{task.dueDate || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={getDueDateText(task.daysLeft, task.dueDate)}
                        size="small"
                        color={getDueDateColor(task.daysLeft)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

    </Container>
  );
};

export default DashboardPage;
