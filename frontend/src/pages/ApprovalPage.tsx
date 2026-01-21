import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import client from "../api/client";
import {
  ApprovalStatus,
  ApprovalType,
} from "../types/approval";
import type {
  ApprovalSummary,
  ApprovalDetail,
  ApprovalFormData,
  ApprovalProcessRequest,
  ApprovalCreateRequest,
  PageResponse,
} from "../types/approval";

// date-fns 사용 대신 Date 객체 사용
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

const ApprovalPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [myDrafts, setMyDrafts] = useState<ApprovalSummary[]>([]);
  const [myPending, setMyPending] = useState<ApprovalSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [detailData, setDetailData] = useState<ApprovalDetail | null>(null);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // 결재 작성 폼
  const [formData, setFormData] = useState<ApprovalFormData>({
    title: "",
    content: "",
    type: ApprovalType.WORK,
    amount: "",
    projectId: "",
    approverIds: [],
  });

  useEffect(() => {
    if (tabValue === 0) {
      fetchMyDrafts();
    } else {
      fetchMyPending();
    }
  }, [tabValue]);

  const fetchMyDrafts = async () => {
    try {
      setLoading(true);
      const response = await client.get<PageResponse<ApprovalSummary>>("/approvals/my-drafts", {
        params: { page: 0, size: 20 },
      });
      setMyDrafts(response.data.content || []);
    } catch (error) {
      console.error("기안함 조회 실패", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPending = async () => {
    try {
      setLoading(true);
      const response = await client.get<PageResponse<ApprovalSummary>>("/approvals/my-pending", {
        params: { page: 0, size: 20 },
      });
      setMyPending(response.data.content || []);
    } catch (error) {
      console.error("결재 대기함 조회 실패", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApproval = async (): Promise<void> => {
    try {
      const payload: ApprovalCreateRequest = {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        approverIds: formData.approverIds,
      };

      if (formData.projectId) {
        payload.projectId = parseInt(formData.projectId);
      }

      if (formData.type === ApprovalType.EXPENSE) {
        if (!formData.amount || !formData.projectId) {
          alert("비용 결재는 프로젝트와 금액이 필수입니다.");
          return;
        }
        payload.amount = parseFloat(formData.amount.replace(/,/g, ""));
      }

      await client.post("/approvals", payload);
      alert("결재 상신이 완료되었습니다.");
      setCreateDialogOpen(false);
      setFormData({
        title: "",
        content: "",
        type: ApprovalType.WORK,
        amount: "",
        projectId: "",
        approverIds: [],
      });
      if (tabValue === 0) {
        fetchMyDrafts();
      }
    } catch (error: unknown) {
      const errorMessage = error && typeof error === "object" && "response" in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      alert(errorMessage || "결재 상신 실패");
      console.error(error);
    }
  };

  const handleViewDetail = async (documentId: number) => {
    setSelectedDocumentId(documentId);
    // TODO: 백엔드 API 연결 필요 - GET /api/approvals/{documentId}
    // 현재는 임시 데이터로 표시
    setDetailData({
      documentId,
      title: "결재 상세 조회 API 연결 필요",
      content: "백엔드 API (GET /api/approvals/{documentId}) 연결이 필요합니다.",
      type: ApprovalType.WORK,
      status: ApprovalStatus.PENDING,
      drafterName: "-",
      department: "-",
      createdAt: new Date().toISOString(),
      approvalLines: [],
    });
    setDetailDialogOpen(true);
  };

  const handleProcessApproval = async (status: ApprovalStatus): Promise<void> => {
    if (!selectedDocumentId) return;

    if (status === ApprovalStatus.REJECTED && !rejectReason.trim()) {
      alert("반려 사유를 입력해주세요.");
      return;
    }

    try {
      const payload: ApprovalProcessRequest = {
        status,
        comment: status === ApprovalStatus.REJECTED ? rejectReason : undefined,
      };
      await client.post(`/approvals/${selectedDocumentId}/process`, payload);
      alert("결재가 정상적으로 처리되었습니다.");
      setProcessDialogOpen(false);
      setDetailDialogOpen(false);
      setRejectReason("");
      fetchMyPending();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === "object" && "response" in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      alert(errorMessage || "결재 처리 실패");
      console.error(error);
    }
  };

  const formatCurrency = (value: string): string => {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const getStatusColor = (status: ApprovalStatus): "success" | "error" | "warning" | "default" => {
    switch (status) {
      case ApprovalStatus.APPROVED:
        return "success";
      case ApprovalStatus.REJECTED:
        return "error";
      case ApprovalStatus.PENDING:
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: ApprovalStatus): string => {
    switch (status) {
      case ApprovalStatus.APPROVED:
        return "승인";
      case ApprovalStatus.REJECTED:
        return "반려";
      case ApprovalStatus.PENDING:
        return "진행중";
      case ApprovalStatus.TEMP:
        return "임시저장";
      default:
        return status;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          전자결재
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          새 결재 기안
        </Button>
      </Box>

      <Paper elevation={2}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="내 기안함" />
          <Tab label="내 결재 대기함" />
        </Tabs>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>제목</TableCell>
                  <TableCell>기안자</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell>기안일</TableCell>
                  <TableCell>작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(tabValue === 0 ? myDrafts : myPending).map((item) => (
                  <TableRow key={item.documentId} hover>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{item.drafterName}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(item.docStatus)}
                        color={getStatusColor(item.docStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {formatDate(item.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => handleViewDetail(item.documentId)}
                      >
                        상세보기
                      </Button>
                      {tabValue === 1 && item.docStatus === ApprovalStatus.PENDING && (
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => {
                            setSelectedDocumentId(item.documentId);
                            handleViewDetail(item.documentId);
                            setProcessDialogOpen(true);
                          }}
                        >
                          결재하기
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(tabValue === 0 ? myDrafts : myPending).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* 결재 작성 다이얼로그 */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>새 결재 기안</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            결재자 선택은 백엔드 API(/api/users) 연결이 필요합니다. 현재는 직접 입력해주세요.
          </Alert>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="제목"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>결재 유형</InputLabel>
                <Select
                  value={formData.type}
                  label="결재 유형"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as ApprovalType })}
                >
                  <MenuItem value="LEAVE">휴가</MenuItem>
                  <MenuItem value="EXPENSE">비용</MenuItem>
                  <MenuItem value="WORK">업무</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formData.type === "EXPENSE" && (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="프로젝트 ID"
                    required
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="금액"
                    required
                    value={formData.amount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setFormData({ ...formData, amount: formatCurrency(value) });
                    }}
                    helperText="숫자 입력 시 콤마 자동 포맷팅"
                  />
                </Grid>
              </>
            )}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="내용"
                required
                multiline
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Alert severity="warning">
                결재자 ID 입력 (쉼표로 구분):{" "}
                <TextField
                  size="small"
                  placeholder="예: 1,2,3"
                  value={formData.approverIds.join(",")}
                  onChange={(e) => {
                    const ids = e.target.value
                      .split(",")
                      .map((id) => parseInt(id.trim()))
                      .filter((id) => !isNaN(id));
                    setFormData({ ...formData, approverIds: ids });
                  }}
                />
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>취소</Button>
          <Button onClick={handleCreateApproval} variant="contained">
            상신하기
          </Button>
        </DialogActions>
      </Dialog>

      {/* 결재 상세 다이얼로그 */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {detailData?.title || "결재 상세"}
        </DialogTitle>
        <DialogContent>
          {detailData && (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>
                결재 상세 조회 API (GET /api/approvals/{selectedDocumentId}) 연결이 필요합니다.
              </Alert>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" color="text.secondary">
                    기안자: {detailData.drafterName} | 부서: {detailData.department} | 기안일:{" "}
                    {formatDate(detailData.createdAt)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" color="text.secondary">
                    유형: {detailData.type} | 상태:{" "}
                    <Chip
                      label={getStatusLabel(detailData.status)}
                      color={getStatusColor(detailData.status)}
                      size="small"
                    />
                  </Typography>
                </Grid>
                {detailData.amount && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h6">금액: {formatCurrency(detailData.amount.toString())}원</Typography>
                  </Grid>
                )}
                {detailData.approvalLines.length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h6" gutterBottom>
                      결재선
                    </Typography>
                    <Stepper orientation="vertical">
                      {detailData.approvalLines.map((line) => (
                        <Step key={line.sequence} completed={line.status === "APPROVED"}>
                          <StepLabel>
                            {line.sequence}차 승인자: {line.approverName} (
                            {getStatusLabel(line.status)})
                          </StepLabel>
                          {line.comment && (
                            <Typography variant="body2" color="text.secondary">
                              의견: {line.comment}
                            </Typography>
                          )}
                        </Step>
                      ))}
                    </Stepper>
                  </Grid>
                )}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" gutterBottom>
                    내용
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: "#f5f5f5" }}>
                    <Typography>{detailData.content}</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>닫기</Button>
          {processDialogOpen && detailData?.status === ApprovalStatus.PENDING && (
            <>
              <Button
                color="error"
                variant="outlined"
                onClick={() => {
                  if (window.confirm("반려하시겠습니까?")) {
                    const reason = prompt("반려 사유를 입력해주세요:");
                    if (reason) {
                      setRejectReason(reason);
                      handleProcessApproval(ApprovalStatus.REJECTED);
                    }
                  }
                }}
              >
                반려
              </Button>
              <Button
                color="primary"
                variant="contained"
                onClick={() => handleProcessApproval(ApprovalStatus.APPROVED)}
              >
                승인
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ApprovalPage;
