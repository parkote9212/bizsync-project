import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Step,
  StepLabel,
  Stepper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import client from "../api/client";
import type {
  ApprovalCreateRequest,
  ApprovalDetail,
  ApprovalFormData,
  ApprovalProcessRequest,
  ApprovalSummary,
  PageResponse,
  UserSearchResult,
} from "../types/approval";
import {
  ApprovalStatus,
  ApprovalType,
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
  const [myCompleted, setMyCompleted] = useState<ApprovalSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [detailData, setDetailData] = useState<ApprovalDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 승인/반려 다이얼로그 상태 (상세보기와 별도)
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [processDocumentId, setProcessDocumentId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // 결재 작성 폼
  const [formData, setFormData] = useState<ApprovalFormData>({
    title: "",
    content: "",
    type: ApprovalType.WORK,
    amount: "",
    projectId: "",
    approvers: [],
  });

  // 사용자 검색
  const [searchOptions, setSearchOptions] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (tabValue === 0) {
      fetchMyDrafts();
    } else if (tabValue === 1) {
      fetchMyPending();
    } else {
      fetchMyCompleted();
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

  const fetchMyCompleted = async () => {
    try {
      setLoading(true);
      const response = await client.get<PageResponse<ApprovalSummary>>("/approvals/my-completed", {
        params: { page: 0, size: 20 },
      });
      setMyCompleted(response.data.content || []);
    } catch (error) {
      console.error("결재 완료함 조회 실패", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUsers = async (keyword: string) => {
    if (!keyword || keyword.length < 2) {
      setSearchOptions([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await client.get(`/users/search?keyword=${keyword}`);
      setSearchOptions(response.data.data || []);
    } catch (error) {
      console.error("사용자 검색 실패:", error);
      setSearchOptions([]);
    } finally {
      setSearchLoading(false);
    }
  };


  const handleCreateApproval = async (): Promise<void> => {
    const approverIds = formData.approvers.map((user) => user.userId);
    if (approverIds.length === 0) {
      alert("결재자를 1명 이상 선택해주세요.");
      return;
    }

    try {
      const payload: ApprovalCreateRequest = {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        approverIds,
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
        approvers: [],
      });
      setSearchOptions([]);
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
    setDetailData(null);
    setDetailDialogOpen(true);
    setDetailLoading(true);
    try {
      const { data } = await client.get<ApprovalDetail>(`/approvals/${documentId}`);
      setDetailData(data);
    } catch (error: unknown) {
      const msg = error && typeof error === "object" && "response" in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      alert(msg || "결재 상세 조회에 실패했습니다.");
      setDetailDialogOpen(false);
      setSelectedDocumentId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenRejectDialog = (documentId: number) => {
    setProcessDocumentId(documentId);
    setProcessDialogOpen(true);
    setRejectReason("");
  };

  const handleApprove = async (documentId: number): Promise<void> => {
    if (!window.confirm("결재를 승인하시겠습니까?")) {
      return;
    }

    try {
      const payload: ApprovalProcessRequest = {
        status: ApprovalStatus.APPROVED,
      };
      await client.post(`/approvals/${documentId}/process`, payload);
      alert("결재가 정상적으로 승인되었습니다.");

      // 상세보기가 열려있으면 닫기
      if (detailDialogOpen && selectedDocumentId === documentId) {
        setDetailDialogOpen(false);
        setSelectedDocumentId(null);
        setDetailData(null);
      }

      // 데이터 새로고침
      fetchMyPending();
      fetchMyCompleted();
      if (tabValue === 0) {
        fetchMyDrafts();
      }
    } catch (error: unknown) {
      const errorMessage = error && typeof error === "object" && "response" in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      alert(errorMessage || "결재 승인 실패");
      console.error(error);
    }
  };

  const handleCancelApproval = async (documentId: number): Promise<void> => {
    if (!window.confirm("결재를 취소하시겠습니까?")) {
      return;
    }

    try {
      await client.post(`/approvals/${documentId}/cancel`);
      alert("결재가 취소되었습니다.");

      // 상세보기가 열려있으면 닫기
      if (detailDialogOpen && selectedDocumentId === documentId) {
        setDetailDialogOpen(false);
        setSelectedDocumentId(null);
        setDetailData(null);
      }

      // 데이터 새로고침
      fetchMyDrafts();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === "object" && "response" in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      alert(errorMessage || "결재 취소 실패");
      console.error(error);
    }
  };

  const handleProcessRejection = async (): Promise<void> => {
    if (!processDocumentId) return;

    if (!rejectReason.trim()) {
      alert("반려 사유를 입력해주세요.");
      return;
    }

    try {
      const payload: ApprovalProcessRequest = {
        status: ApprovalStatus.REJECTED,
        comment: rejectReason,
      };
      await client.post(`/approvals/${processDocumentId}/process`, payload);
      alert("결재가 정상적으로 반려되었습니다.");
      setProcessDialogOpen(false);
      setProcessDocumentId(null);
      setRejectReason("");

      // 상세보기가 열려있으면 닫기
      if (detailDialogOpen && selectedDocumentId === processDocumentId) {
        setDetailDialogOpen(false);
        setSelectedDocumentId(null);
        setDetailData(null);
      }

      // 데이터 새로고침
      fetchMyPending();
      fetchMyCompleted();
      if (tabValue === 0) {
        fetchMyDrafts();
      }
    } catch (error: unknown) {
      const errorMessage = error && typeof error === "object" && "response" in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      alert(errorMessage || "결재 반려 실패");
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
      case ApprovalStatus.CANCELLED:
        return "default";
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
      case ApprovalStatus.CANCELLED:
        return "취소";
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case ApprovalType.LEAVE:
        return "휴가";
      case ApprovalType.EXPENSE:
        return "비용";
      case ApprovalType.WORK:
        return "업무";
      default:
        return type;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        mb={3}
      >
        <Button
          variant="contained"
          size="small"
          onClick={() => setCreateDialogOpen(true)}
          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
        >
          새 결재 기안
        </Button>
      </Box>

      <Paper elevation={2}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="내 기안함" />
          <Tab label="내 결재 대기함" />
          <Tab label="내 결재 완료함" />
        </Tabs>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: 650 }}>
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
                {(tabValue === 0 ? myDrafts : tabValue === 1 ? myPending : myCompleted).map((item) => (
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
                      <Box display="flex" gap={1} sx={{ flexWrap: "wrap" }}>
                        <Button
                          size="small"
                          onClick={() => handleViewDetail(item.documentId)}
                          sx={{ fontSize: { xs: "0.7rem", sm: "0.8125rem" } }}
                        >
                          상세보기
                        </Button>
                        {tabValue === 1 && item.docStatus === ApprovalStatus.PENDING && (
                          <>
                            <Button
                              size="small"
                              color="primary"
                              variant="contained"
                              onClick={() => handleApprove(item.documentId)}
                              sx={{ fontSize: { xs: "0.7rem", sm: "0.8125rem" } }}
                            >
                              승인
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              onClick={() => handleOpenRejectDialog(item.documentId)}
                              sx={{ fontSize: { xs: "0.7rem", sm: "0.8125rem" } }}
                            >
                              반려
                            </Button>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {(tabValue === 0 ? myDrafts : tabValue === 1 ? myPending : myCompleted).length === 0 && (
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
            각 결재자의 사용자 ID를 입력하세요. 결재선은 위에서부터 1차, 2차 순서로 진행됩니다.
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
              <Typography variant="subtitle2" gutterBottom>
                결재선 (순서대로 1차, 2차, …)
              </Typography>
              <Autocomplete
                multiple
                options={searchOptions}
                value={formData.approvers}
                onChange={(_event, newValue) => {
                  setFormData({ ...formData, approvers: newValue });
                }}
                onInputChange={(_event, newInputValue) => {
                  handleSearchUsers(newInputValue);
                }}
                getOptionLabel={(option) => `${option.name} (${option.email})`}
                loading={searchLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="결재자 검색 (이름 또는 이메일)"
                    placeholder="최소 2글자 입력"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {searchLoading ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {option.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.email}
                      </Typography>
                      {(option.position || option.department) && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {option.position && option.department
                            ? `${option.position} · ${option.department}`
                            : option.position || option.department}
                        </Typography>
                      )}
                    </Box>
                  </li>
                )}
                noOptionsText="검색 결과가 없습니다"
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                * 선택한 순서대로 결재가 진행됩니다.
              </Typography>
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
          {detailLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : detailData ? (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary">
                  기안자: {detailData.drafterName} | 부서: {detailData.department} | 기안일:{" "}
                  {formatDate(detailData.createdAt)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary">
                  유형: {getTypeLabel(detailData.type)} | 상태:{" "}
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
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>닫기</Button>

          {/* 기안자: PENDING 상태일 때 취소 버튼 */}
          {detailData?.status === ApprovalStatus.PENDING && tabValue === 0 && (
            <Button
              color="error"
              variant="outlined"
              onClick={() => {
                if (selectedDocumentId) {
                  handleCancelApproval(selectedDocumentId);
                }
              }}
            >
              결재 취소
            </Button>
          )}

          {/* 결재자: PENDING 상태일 때 승인/반려 버튼 */}
          {detailData?.status === ApprovalStatus.PENDING && tabValue === 1 && (
            <>
              <Button
                color="primary"
                variant="contained"
                onClick={() => {
                  if (selectedDocumentId) {
                    handleApprove(selectedDocumentId);
                  }
                }}
              >
                승인
              </Button>
              <Button
                color="error"
                variant="outlined"
                onClick={() => {
                  if (selectedDocumentId) {
                    handleOpenRejectDialog(selectedDocumentId);
                  }
                }}
              >
                반려
              </Button>

            </>
          )}
        </DialogActions>
      </Dialog>

      {/* 반려 처리 다이얼로그 (사유 입력) */}
      <Dialog open={processDialogOpen} onClose={() => setProcessDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>결재 반려</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            반려 사유를 입력해주세요.
          </Typography>
          <TextField
            fullWidth
            label="반려 사유"
            required
            multiline
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="반려 사유를 입력해주세요."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setProcessDialogOpen(false);
            setProcessDocumentId(null);
            setRejectReason("");
          }}>
            취소
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleProcessRejection}
          >
            반려
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ApprovalPage;
