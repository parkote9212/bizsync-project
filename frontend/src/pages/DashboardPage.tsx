import ApprovalIcon from "@mui/icons-material/Approval";
import AssignmentIcon from "@mui/icons-material/Assignment";
import FolderIcon from "@mui/icons-material/Folder";
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  Skeleton,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import client from "../api/client";
import type { Notice, Task } from "../types/common";

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [projectCount, setProjectCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);

  // 대시보드 통계 데이터 로드
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // 대시보드 통계 API 호출
        const response = await client.get("/dashboard/stats");

        if (response.data?.status === "SUCCESS" && response.data?.data) {
          const stats = response.data.data;
          setProjectCount(stats.projectCount || 0);
          setTaskCount(stats.taskCount || 0);
          setPendingApprovalCount(stats.pendingApprovalCount || 0);
        } else {
          // 예상치 못한 응답 형식
          console.warn("예상치 못한 응답 형식:", response.data);
          setProjectCount(0);
          setTaskCount(0);
          setPendingApprovalCount(0);
        }
      } catch (error) {
        console.error("대시보드 데이터 로드 실패:", error);
        // 에러 발생 시 0으로 초기화
        setProjectCount(0);
        setTaskCount(0);
        setPendingApprovalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [location.key]); // location.key가 변경될 때마다 (페이지 방문할 때마다) 실행

  // 카드 클릭 핸들러
  const handleProjectCardClick = () => {
    navigate("/projects");
  };

  const handleTaskCardClick = () => {
    // 업무 목록 페이지가 구현되면 이동
    // navigate("/tasks");
    console.log("업무 페이지는 아직 구현되지 않았습니다.");
  };

  const handleApprovalCardClick = () => {
    navigate("/approvals");
  };

  // TODO: 백엔드 API 연결 필요 - 내 업무 리스트, 공지사항
  const myTasks: Task[] = [
    { id: 1, title: "API 설계 문서 작성", dueDate: "2024-01-20", daysLeft: 3 },
    { id: 2, title: "데이터베이스 마이그레이션", dueDate: "2024-01-22", daysLeft: 5 },
    { id: 3, title: "프론트엔드 테스트 코드 작성", dueDate: "2024-01-25", daysLeft: 8 },
    { id: 4, title: "배포 스크립트 수정", dueDate: "2024-01-28", daysLeft: 11 },
    { id: 5, title: "문서화 업데이트", dueDate: "2024-01-30", daysLeft: 13 },
  ];

  const notices: Notice[] = [
    { id: 1, title: "2024년 1분기 회사 전체 회의 안내", date: "2024-01-15" },
    { id: 2, title: "복지제도 변경 사항 안내", date: "2024-01-10" },
    { id: 3, title: "신규 프로젝트 투입 안내", date: "2024-01-08" },
  ];

  // Skeleton 렌더링 함수
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

      {/* 상단 통계 카드 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* 1. 진행 중인 프로젝트 수 */}
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

        {/* 2. 내가 진행 중인 업무 수 */}
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

        {/* 3. 대기 중인 결재 수 */}
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

      {/* 하단 영역 - 최근 활동 (선택사항) */}
      <Grid container spacing={3}>
        {/* 내 업무 리스트 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              내 업무 리스트
            </Typography>
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
                백엔드 API 구현이 필요합니다
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* 최근 활동 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              최근 활동
            </Typography>
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
                백엔드 API 구현이 필요합니다
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;
