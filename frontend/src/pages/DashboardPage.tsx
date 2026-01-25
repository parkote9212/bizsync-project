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

/**
 * 내 업무 정보 인터페이스
 */
interface MyTask {
  taskId: number;
  title: string;
  projectName: string;
  columnName: string;
  dueDate: string | null;
  daysLeft: number | null;
}

/**
 * 대시보드 페이지 컴포넌트
 *
 * <p>사용자의 프로젝트, 업무, 결재 현황을 한눈에 볼 수 있는 대시보드입니다.
 * 통계 카드와 내 업무 리스트를 표시합니다.
 *
 * @component
 * @returns {JSX.Element} 대시보드 페이지
 */
const DashboardPage = () => {
  // 상태 관리 섹션
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [projectCount, setProjectCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
  const [myTasks, setMyTasks] = useState<MyTask[]>([]);

  // 데이터 로드 섹션
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

  // 이벤트 핸들러 섹션
  const handleProjectCardClick = () => {
    navigate("/projects");
  };

  const handleTaskCardClick = () => {
    console.log("업무 페이지는 아직 구현되지 않았습니다.");
  };

  const handleApprovalCardClick = () => {
    navigate("/approvals");
  };

  /**
   * 마감일까지 남은 일수에 따른 색상 반환
   *
   * @param {number | null} daysLeft - 마감일까지 남은 일수 (null인 경우 마감일 없음)
   * @returns {"default" | "error" | "warning" | "success"} MUI Chip 색상
   */
  const getDueDateColor = (daysLeft: number | null) => {
    if (daysLeft === null) return "default";
    if (daysLeft < 0) return "error";
    if (daysLeft <= 3) return "error";
    if (daysLeft <= 7) return "warning";
    return "success";
  };

  /**
   * 마감일까지 남은 일수에 따른 텍스트 반환
   *
   * @param {number | null} daysLeft - 마감일까지 남은 일수
   * @param {string | null} dueDate - 마감일 문자열
   * @returns {string} 마감일 관련 텍스트
   */
  const getDueDateText = (daysLeft: number | null, dueDate: string | null) => {
    if (!dueDate) return "마감일 없음";
    if (daysLeft === null) return dueDate;
    if (daysLeft < 0) return `${Math.abs(daysLeft)}일 지남`;
    if (daysLeft === 0) return "오늘 마감";
    return `${daysLeft}일 남음`;
  };

  // 유틸리티 함수 섹션
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

  {/* 렌더링 섹션 */}
  return (
    <Container maxWidth="lg">
      {/* 통계 카드 섹션 */}
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

      {/* 내 업무 리스트 섹션 */}
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
