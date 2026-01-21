import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import DescriptionIcon from "@mui/icons-material/Description";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import client from "../api/client";
import type { DashboardSummary, Task, Notice } from "../types/common";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState<DashboardSummary>({
    inProgressTasks: 0,
    pendingApprovals: 0,
    remainingBudget: 0,
  });

  // TODO: 백엔드 API 연결 필요 - /api/dashboard/summary
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        // TODO: 실제 API 호출로 변경
        // const response = await client.get("/dashboard/summary");
        // setSummaryData(response.data);
        
        // 임시 데이터
        setSummaryData({
          inProgressTasks: 3,
          pendingApprovals: 2,
          remainingBudget: 2500000,
        });
      } catch (error) {
        console.error("대시보드 데이터 로드 실패", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" fontWeight="bold" mb={3}>
        내 대시보드
      </Typography>

      {/* TODO: 백엔드 API 연결 필요 - Summary Widget 데이터 */}
      <Alert severity="info" sx={{ mb: 3 }}>
        대시보드 요약 데이터는 백엔드 API(/api/dashboard/summary) 연결이 필요합니다.
      </Alert>

      {/* 상단 카드 (Summary Widget) */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <WorkIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
                <Typography variant="h6" color="text.secondary">
                  진행 중 업무
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {summaryData.inProgressTasks}건
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={2}
            sx={{ cursor: "pointer", "&:hover": { boxShadow: 4 } }}
            onClick={() => {
              navigate("/approvals");
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <DescriptionIcon color="secondary" sx={{ mr: 1, fontSize: 32 }} />
                <Typography variant="h6" color="text.secondary">
                  결재 대기
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="secondary">
                {summaryData.pendingApprovals}건
              </Typography>
              <Typography variant="caption" color="text.secondary" mt={1} display="block">
                클릭 시 결재함으로 이동
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <AttachMoneyIcon color="success" sx={{ mr: 1, fontSize: 32 }} />
                <Typography variant="h6" color="text.secondary">
                  이번 달 잔여 예산
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {formatCurrency(summaryData.remainingBudget)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 중앙 영역 */}
      <Grid container spacing={3}>
        {/* 내 업무 리스트 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              내 업무 리스트
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              백엔드 API(/api/tasks/my-tasks) 연결이 필요합니다.
            </Alert>
            <List>
              {myTasks.map((task) => (
                <ListItem
                  key={task.id}
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                    mb: 1,
                    "&:hover": { bgcolor: "#f5f5f5" },
                  }}
                >
                  <ListItemText
                    primary={task.title}
                    secondary={`마감일: ${task.dueDate}`}
                  />
                  <Chip
                    label={`D-${task.daysLeft}`}
                    color={task.daysLeft <= 3 ? "error" : task.daysLeft <= 7 ? "warning" : "default"}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* 공지사항 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              공지사항
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              백엔드 API(/api/notices) 연결이 필요합니다.
            </Alert>
            <List>
              {notices.map((notice) => (
                <ListItem
                  key={notice.id}
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                    mb: 1,
                    "&:hover": { bgcolor: "#f5f5f5", cursor: "pointer" },
                  }}
                >
                  <ListItemText
                    primary={notice.title}
                    secondary={notice.date}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;
