import {
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  Folder as FolderIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import client from "../api/client";
import { useUserStore } from "../stores/userStore";
import type { AdminDashboardStatistics } from "../types/admin";

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
      <Box sx={{ width: "100%", px: { xs: 2, sm: 3, md: 4 } }}>
        <Alert severity="error">관리자 권한이 필요합니다.</Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ width: "100%", px: { xs: 2, sm: 3, md: 4 } }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  // 차트 데이터 준비
  const userStatusData = statistics
    ? [
      { name: "활성", value: statistics.activeUsers, color: "#4caf50" },
      { name: "대기", value: statistics.pendingUsers, color: "#ff9800" },
      { name: "정지", value: statistics.suspendedUsers, color: "#f44336" },
      { name: "삭제", value: statistics.deletedUsers, color: "#9e9e9e" },
    ].filter((item) => item.value > 0)
    : [];

  const userRoleData = statistics
    ? [
      { name: "관리자", value: statistics.adminUsers, color: "#2196f3" },
      { name: "매니저", value: statistics.managerUsers, color: "#9c27b0" },
      { name: "멤버", value: statistics.memberUsers, color: "#00bcd4" },
    ].filter((item) => item.value > 0)
    : [];

  const projectStatusData = statistics
    ? [
      { name: "기획중", value: statistics.planningProjects },
      { name: "진행중", value: statistics.inProgressProjects },
      { name: "완료", value: statistics.completedProjects },
      { name: "보류", value: statistics.onHoldProjects },
      { name: "취소", value: statistics.cancelledProjects },
    ].filter((item) => item.value > 0)
    : [];

  const positionData = statistics
    ? [
      { name: "사원", value: statistics.staffUsers, color: "#2196f3" },
      { name: "대리", value: statistics.seniorUsers, color: "#4caf50" },
      { name: "과장", value: statistics.assistantManagerUsers, color: "#ff9800" },
      { name: "차장", value: statistics.deputyGeneralManagerUsers, color: "#9c27b0" },
      { name: "부장", value: statistics.generalManagerUsers, color: "#f44336" },
      { name: "이사", value: statistics.directorUsers, color: "#00bcd4" },
      { name: "임원", value: statistics.executiveUsers, color: "#795548" },
    ].filter((item) => item.value > 0)
    : [];


  return (
    <Box sx={{ width: "100%", px: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          관리자 대시보드
        </Typography>
      </Box>

      {statistics && (
        <>
          {/* 핵심 KPI 카드 */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <PeopleIcon sx={{ mr: 1, color: "primary.main", fontSize: 28 }} />
                    <Typography color="textSecondary" variant="body2">
                      전체 사용자
                    </Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="bold">
                    {statistics.totalUsers}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <TrendingUpIcon sx={{ fontSize: 16, color: "success.main", mr: 0.5 }} />
                    <Typography variant="caption" color="success.main">
                      활성: {statistics.activeUsers}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <FolderIcon sx={{ mr: 1, color: "info.main", fontSize: 28 }} />
                    <Typography color="textSecondary" variant="body2">
                      전체 프로젝트
                    </Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="bold">
                    {statistics.totalProjects}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <TrendingUpIcon sx={{ fontSize: 16, color: "info.main", mr: 0.5 }} />
                    <Typography variant="caption" color="info.main">
                      진행중: {statistics.inProgressProjects}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <AssignmentIcon sx={{ mr: 1, color: "warning.main", fontSize: 28 }} />
                    <Typography color="textSecondary" variant="body2">
                      전체 업무
                    </Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="bold">
                    {statistics.totalTasks}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <DescriptionIcon sx={{ mr: 1, color: "secondary.main", fontSize: 28 }} />
                    <Typography color="textSecondary" variant="body2">
                      전체 결재
                    </Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="bold">
                    {statistics.totalApprovals}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* 차트 영역 */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* 사용자 상태별 파이 차트 */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    사용자 상태 분포
                  </Typography>
                  {userStatusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={userStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {userStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                      <Typography color="textSecondary">데이터가 없습니다.</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* 역할별 사용자 분포 파이 차트 */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    역할별 사용자 분포
                  </Typography>
                  {userRoleData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={userRoleData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {userRoleData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                      <Typography color="textSecondary">데이터가 없습니다.</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* 프로젝트 상태별 막대 차트 */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    프로젝트 상태별 현황
                  </Typography>
                  {projectStatusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={projectStatusData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#2196f3" name="프로젝트 수" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                      <Typography color="textSecondary">데이터가 없습니다.</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* 직급별 사용자 분포 파이 차트 */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    직급별 사용자 분포
                  </Typography>
                  {positionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={positionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {positionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                      <Typography color="textSecondary">데이터가 없습니다.</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* 상세 통계 카드 */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    사용자 상세 통계
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 6 }}>
                      <Box>
                        <Typography color="textSecondary" variant="body2">
                          승인 대기
                        </Typography>
                        <Typography variant="h5" color="warning.main">
                          {statistics.pendingUsers}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box>
                        <Typography color="textSecondary" variant="body2">
                          활성 사용자
                        </Typography>
                        <Typography variant="h5" color="success.main">
                          {statistics.activeUsers}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box>
                        <Typography color="textSecondary" variant="body2">
                          정지된 사용자
                        </Typography>
                        <Typography variant="h5" color="error.main">
                          {statistics.suspendedUsers}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box>
                        <Typography color="textSecondary" variant="body2">
                          삭제된 사용자
                        </Typography>
                        <Typography variant="h5" color="text.secondary">
                          {statistics.deletedUsers}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    프로젝트 상세 통계
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 6 }}>
                      <Box>
                        <Typography color="textSecondary" variant="body2">
                          기획중
                        </Typography>
                        <Typography variant="h5">{statistics.planningProjects}</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box>
                        <Typography color="textSecondary" variant="body2">
                          진행중
                        </Typography>
                        <Typography variant="h5" color="info.main">
                          {statistics.inProgressProjects}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box>
                        <Typography color="textSecondary" variant="body2">
                          완료
                        </Typography>
                        <Typography variant="h5" color="success.main">
                          {statistics.completedProjects}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box>
                        <Typography color="textSecondary" variant="body2">
                          보류/취소
                        </Typography>
                        <Typography variant="h5">
                          {statistics.onHoldProjects + statistics.cancelledProjects}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default AdminDashboardPage;
