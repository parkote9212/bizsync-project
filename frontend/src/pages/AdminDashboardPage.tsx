import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  People as PeopleIcon,
  Folder as FolderIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import client from "../api/client";
import type { AdminDashboardStatistics } from "../types/admin";
import { useUserStore } from "../stores/userStore";
import { Alert } from "@mui/material";

const AdminDashboardPage = () => {
  const user = useUserStore((state) => state.user);
  const [statistics, setStatistics] = useState<AdminDashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.role !== "ADMIN") {
      return;
    }
    fetchStatistics();
  }, [user.role]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await client.get("/admin/dashboard");
      setStatistics(response.data);
    } catch (error) {
      console.error("관리자 대시보드 데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  if (user.role !== "ADMIN") {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">관리자 권한이 필요합니다.</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          관리자 대시보드
        </Typography>
      </Box>

      {statistics && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                사용자 통계
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <PeopleIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography color="textSecondary">전체 사용자</Typography>
                  </Box>
                  <Typography variant="h4">{statistics.totalUsers}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <PeopleIcon sx={{ mr: 1, color: "warning.main" }} />
                    <Typography color="textSecondary">승인 대기</Typography>
                  </Box>
                  <Typography variant="h4" color="warning.main">
                    {statistics.pendingUsers}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <PeopleIcon sx={{ mr: 1, color: "success.main" }} />
                    <Typography color="textSecondary">활성 사용자</Typography>
                  </Box>
                  <Typography variant="h4" color="success.main">
                    {statistics.activeUsers}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <PeopleIcon sx={{ mr: 1, color: "error.main" }} />
                    <Typography color="textSecondary">정지된 사용자</Typography>
                  </Box>
                  <Typography variant="h4" color="error.main">
                    {statistics.suspendedUsers}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    관리자
                  </Typography>
                  <Typography variant="h5">{statistics.adminUsers}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    매니저
                  </Typography>
                  <Typography variant="h5">{statistics.managerUsers}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    멤버
                  </Typography>
                  <Typography variant="h5">{statistics.memberUsers}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                프로젝트 통계
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <FolderIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography color="textSecondary">전체 프로젝트</Typography>
                  </Box>
                  <Typography variant="h4">{statistics.totalProjects}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    진행 중
                  </Typography>
                  <Typography variant="h5" color="info.main">
                    {statistics.inProgressProjects}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    완료
                  </Typography>
                  <Typography variant="h5" color="success.main">
                    {statistics.completedProjects}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <AssignmentIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography color="textSecondary">전체 업무</Typography>
                  </Box>
                  <Typography variant="h4">{statistics.totalTasks}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <DescriptionIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography color="textSecondary">전체 결재 문서</Typography>
                  </Box>
                  <Typography variant="h4">{statistics.totalApprovals}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default AdminDashboardPage;
