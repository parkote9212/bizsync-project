import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Pagination,
  Stack,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Block as BlockIcon,
  PlayArrow as PlayArrowIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  LockReset as LockResetIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import Tooltip from "@mui/material/Tooltip";
import client from "../api/client";
import type { AdminUser, AccountStatus, UserRole, AdminUserStatistics } from "../types/admin";
import { useUserStore } from "../stores/userStore";

/**
 * 관리자 사용자 관리 페이지 컴포넌트
 *
 * <p>관리자가 사용자 목록을 조회하고, 사용자 상태 변경, 권한 변경, 직급 변경, 비밀번호 재설정 등의 작업을 수행할 수 있는 페이지입니다.
 * 사용자 통계, 필터링, 검색 기능을 제공합니다.
 *
 * @component
 * @returns {JSX.Element} 관리자 사용자 관리 페이지
 */
const AdminUserManagementPage = () => {
  // 상태 관리 섹션
  const user = useUserStore((state) => state.user);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState<AccountStatus | "">("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [positionFilter, setPositionFilter] = useState<string>("");
  const [keyword, setKeyword] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("MEMBER");
  const [newPosition, setNewPosition] = useState<string>("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const [statistics, setStatistics] = useState<AdminUserStatistics | null>(null);

  // 데이터 로드 섹션
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("size", "20");
      if (statusFilter) params.append("status", statusFilter);
      if (roleFilter) params.append("role", roleFilter);
      if (positionFilter) params.append("position", positionFilter);
      if (keyword) params.append("keyword", keyword);

      const response = await client.get<{
        content: AdminUser[];
        totalPages: number;
        totalElements: number;
        number: number;
        size: number;
      }>(`/admin/users?${params.toString()}`);
      const data = response.data;
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("사용자 목록 조회 실패:", error);
      setSnackbar({ open: true, message: "사용자 목록을 불러오는데 실패했습니다.", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, roleFilter, positionFilter, keyword]);

  useEffect(() => {
    if (user.role !== "ADMIN") {
      return;
    }
    fetchUsers();
    fetchStatistics();
  }, [page, statusFilter, roleFilter, positionFilter, keyword, user.role, fetchUsers]);

  const fetchStatistics = async () => {
    try {
      const response = await client.get("/admin/users/statistics");
      setStatistics(response.data);
    } catch (error) {
      console.error("통계 조회 실패:", error);
    }
  };

  // 이벤트 핸들러 섹션
  const handleAction = async () => {
    if (!selectedUser) return;

    try {
      switch (actionType) {
        case "approve":
          await client.patch(`/admin/users/${selectedUser.userId}/approve`);
          break;
        case "reject":
          await client.patch(`/admin/users/${selectedUser.userId}/reject`);
          break;
        case "suspend":
          await client.patch(`/admin/users/${selectedUser.userId}/suspend`);
          break;
        case "activate":
          await client.patch(`/admin/users/${selectedUser.userId}/activate`);
          break;
        case "delete":
          await client.delete(`/admin/users/${selectedUser.userId}`);
          break;
        case "resetPassword":
          if (!newPassword || newPassword.length < 8) {
            setSnackbar({ open: true, message: "비밀번호는 최소 8자 이상이어야 합니다.", severity: "error" });
            return;
          }
          await client.patch(`/admin/users/${selectedUser.userId}/reset-password`, {
            newPassword,
          });
          break;
        case "changeRole":
          await client.patch(`/admin/users/${selectedUser.userId}/role`, {
            role: newRole,
          });
          break;
        case "changePosition": {
          const positionValue = newPosition && newPosition.trim() !== "" ? newPosition : null;
          await client.patch(`/admin/users/${selectedUser.userId}/position`, {
            position: positionValue,
          });
          break;
        }
      }

      setActionDialogOpen(false);
      setSelectedUser(null);
      setNewPassword("");
      setNewRole("MEMBER");
      setNewPosition("");
      fetchUsers();
      fetchStatistics();
      setSnackbar({ open: true, message: "작업이 완료되었습니다.", severity: "success" });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "작업 중 오류가 발생했습니다.";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    }
  };

  const openActionDialog = (user: AdminUser, type: string) => {
    setSelectedUser(user);
    setActionType(type);
    setActionDialogOpen(true);
  };

  // 유틸리티 함수 섹션
  /**
   * 계정 상태에 따른 색상 반환
   *
   * @param {AccountStatus} status - 계정 상태
   * @returns {"success" | "warning" | "error" | "default"} MUI Chip 색상
   */
  const getStatusColor = (status: AccountStatus) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "PENDING":
        return "warning";
      case "SUSPENDED":
        return "error";
      case "DELETED":
        return "default";
      default:
        return "default";
    }
  };

  /**
   * 계정 상태에 따른 라벨 반환
   *
   * @param {AccountStatus} status - 계정 상태
   * @returns {string} 상태 라벨
   */
  const getStatusLabel = (status: AccountStatus) => {
    switch (status) {
      case "ACTIVE":
        return "활성";
      case "PENDING":
        return "대기";
      case "SUSPENDED":
        return "정지";
      case "DELETED":
        return "삭제";
      default:
        return status;
    }
  };

  /**
   * 사용자 권한에 따른 라벨 반환
   *
   * @param {UserRole} role - 사용자 권한
   * @returns {string} 권한 라벨
   */
  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "관리자";
      case "MANAGER":
        return "매니저";
      case "MEMBER":
        return "멤버";
      default:
        return role;
    }
  };

  if (user.role !== "ADMIN") {
    return (
      <Box sx={{ width: "100%", px: { xs: 2, sm: 3, md: 4 } }}>
        <Alert severity="error">관리자 권한이 필요합니다.</Alert>
      </Box>
    );
  }

  // 렌더링 섹션
  return (
    <Box sx={{ width: "100%", px: { xs: 2, sm: 3, md: 4 } }}>
      {/* 헤더 섹션 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          사용자 관리
        </Typography>

        {/* 통계 카드 섹션 */}
        {statistics && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    전체 사용자
                  </Typography>
                  <Typography variant="h5">{statistics.totalUsers}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    승인 대기
                  </Typography>
                  <Typography variant="h5" color="warning.main">
                    {statistics.pendingUsers}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    활성 사용자
                  </Typography>
                  <Typography variant="h5" color="success.main">
                    {statistics.activeUsers}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    정지된 사용자
                  </Typography>
                  <Typography variant="h5" color="error.main">
                    {statistics.suspendedUsers}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* 필터 섹션 */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="이름 또는 이메일 검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Select
                fullWidth
                size="small"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AccountStatus | "")}
                displayEmpty
              >
                <MenuItem value="">전체 상태</MenuItem>
                <MenuItem value="PENDING">승인 대기</MenuItem>
                <MenuItem value="ACTIVE">활성</MenuItem>
                <MenuItem value="SUSPENDED">정지</MenuItem>
                <MenuItem value="DELETED">삭제</MenuItem>
              </Select>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Select
                fullWidth
                size="small"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as UserRole | "")}
                displayEmpty
              >
                <MenuItem value="">전체 권한</MenuItem>
                <MenuItem value="ADMIN">관리자</MenuItem>
                <MenuItem value="MANAGER">매니저</MenuItem>
                <MenuItem value="MEMBER">멤버</MenuItem>
              </Select>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Select
                fullWidth
                size="small"
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                displayEmpty
              >
                <MenuItem value="">전체 직급</MenuItem>
                <MenuItem value="STAFF">사원</MenuItem>
                <MenuItem value="SENIOR">대리</MenuItem>
                <MenuItem value="ASSISTANT_MANAGER">과장</MenuItem>
                <MenuItem value="DEPUTY_GENERAL_MANAGER">차장</MenuItem>
                <MenuItem value="GENERAL_MANAGER">부장</MenuItem>
                <MenuItem value="DIRECTOR">이사</MenuItem>
                <MenuItem value="EXECUTIVE">임원</MenuItem>
              </Select>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  setPage(0);
                  fetchUsers();
                }}
              >
                검색
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* 사용자 목록 테이블 섹션 */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>이메일</TableCell>
                <TableCell>이름</TableCell>
                <TableCell>부서</TableCell>
                <TableCell>직급</TableCell>
                <TableCell>권한</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>가입일</TableCell>
                <TableCell align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    로딩 중...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    사용자가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.department || "-"}</TableCell>
                    <TableCell>{user.position || "-"}</TableCell>
                    <TableCell>{getRoleLabel(user.role)}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(user.status)}
                        color={getStatusColor(user.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                        {user.status === "PENDING" && (
                          <>
                            <Tooltip title="승인">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => openActionDialog(user, "approve")}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="거부">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => openActionDialog(user, "reject")}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        {user.status === "ACTIVE" && (
                          <Tooltip title="정지">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => openActionDialog(user, "suspend")}
                            >
                              <BlockIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {user.status === "SUSPENDED" && (
                          <Tooltip title="활성화">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => openActionDialog(user, "activate")}
                            >
                              <PlayArrowIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="권한 변경">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              setSelectedUser(user);
                              setNewRole(user.role);
                              setActionType("changeRole");
                              setActionDialogOpen(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="직급 변경">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => {
                              setSelectedUser(user);
                              setNewPosition(user.position || "");
                              setActionType("changePosition");
                              setActionDialogOpen(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="비밀번호 재설정">
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => {
                              setSelectedUser(user);
                              setActionType("resetPassword");
                              setActionDialogOpen(true);
                            }}
                          >
                            <LockResetIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="삭제">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => openActionDialog(user, "delete")}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page + 1}
              onChange={(_, value) => setPage(value - 1)}
              color="primary"
            />
          </Box>
        )}

        {/* 다이얼로그 섹션 */}
        <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {actionType === "approve" && "사용자 승인"}
            {actionType === "reject" && "사용자 거부"}
            {actionType === "suspend" && "사용자 정지"}
            {actionType === "activate" && "사용자 활성화"}
            {actionType === "delete" && "사용자 삭제"}
            {actionType === "resetPassword" && "비밀번호 재설정"}
            {actionType === "changeRole" && "권한 변경"}
            {actionType === "changePosition" && "직급 변경"}
          </DialogTitle>
          <DialogContent>
            {selectedUser && (
              <Box>
                <Typography variant="body1" gutterBottom>
                  사용자: {selectedUser.name} ({selectedUser.email})
                </Typography>
                {actionType === "resetPassword" && (
                  <TextField
                    fullWidth
                    type="password"
                    label="새 비밀번호"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    margin="normal"
                    helperText="최소 8자 이상 입력하세요"
                  />
                )}
                {actionType === "changeRole" && (
                  <Select
                    fullWidth
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    margin="dense"
                  >
                    <MenuItem value="MEMBER">멤버</MenuItem>
                    <MenuItem value="MANAGER">매니저</MenuItem>
                    <MenuItem value="ADMIN">관리자</MenuItem>
                  </Select>
                )}
                {actionType === "changePosition" && (
                  <Select
                    fullWidth
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    margin="dense"
                    displayEmpty
                  >
                    <MenuItem value="">직급 없음</MenuItem>
                    <MenuItem value="STAFF">사원</MenuItem>
                    <MenuItem value="SENIOR">대리</MenuItem>
                    <MenuItem value="ASSISTANT_MANAGER">과장</MenuItem>
                    <MenuItem value="DEPUTY_GENERAL_MANAGER">차장</MenuItem>
                    <MenuItem value="GENERAL_MANAGER">부장</MenuItem>
                    <MenuItem value="DIRECTOR">이사</MenuItem>
                    <MenuItem value="EXECUTIVE">임원</MenuItem>
                  </Select>
                )}
                {(actionType === "delete" || actionType === "reject") && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    이 작업은 되돌릴 수 없습니다. 정말 진행하시겠습니까?
                  </Alert>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActionDialogOpen(false)}>취소</Button>
            <Button onClick={handleAction} variant="contained" color={actionType === "delete" ? "error" : "primary"}>
              확인
            </Button>
          </DialogActions>
        </Dialog>

        {/* 알림 섹션 */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default AdminUserManagementPage;
