import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import client from "../api/client";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/userStore";
import { useNotificationStore } from "../stores/notificationStore";
import { useProjectStore } from "../stores/projectStore";
import Toast from "../components/Toast";
import { createToastState, closeToast, type ToastState } from "../utils/toast";

/**
 * 로그인 페이지 컴포넌트
 *
 * <p>사용자 로그인 및 회원가입 기능을 제공하는 페이지입니다.
 * 로그인 성공 시 사용자 역할에 따라 관리자 대시보드 또는 일반 대시보드로 이동합니다.
 *
 * @component
 * @returns {JSX.Element} 로그인 페이지
 */
const LoginPage = () => {
  // 상태 관리 섹션
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);
  const clearNotifications = useNotificationStore((state) => state.clearAll);
  const resetProjects = useProjectStore((state) => state.reset);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [signupOpen, setSignupOpen] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmpNo, setSignupEmpNo] = useState("");
  const [signupDepartment, setSignupDepartment] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [toast, setToast] = useState<ToastState>({ open: false, message: "", severity: "success" });

  // 이벤트 핸들러 섹션
  /**
   * 로그인 처리 핸들러
   *
   * @param {React.FormEvent} e - 폼 제출 이벤트
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await client.post<{
        accessToken: string;
        refreshToken: string;
        userId: number;
        name: string;
        email: string;
        role: string;
        position?: string;
        department?: string;
      }>("/auth/login", {
        email,
        password,
      });

      const {
        accessToken,
        refreshToken,
        userId,
        name: userName,
        email: userEmail,
        role,
        position,
        department
      } = response.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      clearNotifications();
      resetProjects();

      setUser({
        userId: userId || null,
        name: userName || null,
        email: userEmail || null,
        role: role || null,
        position: position || null,
        department: department || null,
      });

      setToast(createToastState("로그인 성공!", "success"));
      // 관리자는 관리자 대시보드로, 일반 사용자는 일반 대시보드로 이동
      if (role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      console.error(err);
      const axiosError = err as { response?: { data?: { message?: string; error?: string } } };
      const errorMessage = axiosError.response?.data?.message ||
                          axiosError.response?.data?.error ||
                          "로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.";
      setError(errorMessage);
    }
  };

  /**
   * 회원가입 처리 핸들러
   *
   * @param {React.FormEvent} e - 폼 제출 이벤트
   */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");
    setSignupSuccess(false);

    try {
      await client.post("/auth/signup", {
        email: signupEmail,
        password: signupPassword,
        name: signupName,
        empNo: signupEmpNo || undefined,
        department: signupDepartment || undefined,
      });

      setSignupSuccess(true);
      setTimeout(() => {
        setSignupOpen(false);
        setSignupEmail("");
        setSignupPassword("");
        setSignupName("");
        setSignupEmpNo("");
        setSignupDepartment("");
        setSignupSuccess(false);
        setToast(createToastState("회원가입 성공! 관리자 승인을 기다려주세요.", "success"));
      }, 1500);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          "회원가입에 실패했습니다. 다시 시도해주세요.";
      setSignupError(errorMessage);
    }
  };

  /**
   * 회원가입 다이얼로그 닫기 핸들러
   * 다이얼로그를 닫을 때 모든 상태를 초기화합니다.
   */
  const handleSignupDialogClose = () => {
    setSignupOpen(false);
    setSignupEmail("");
    setSignupPassword("");
    setSignupName("");
    setSignupEmpNo("");
    setSignupDepartment("");
    setSignupError("");
    setSignupSuccess(false);
  };

  // 렌더링 섹션
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Container component="main" maxWidth="xs">
        {/* 로그인 폼 섹션 */}
        <Paper
          elevation={6}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: 2,
          }}
        >
          <Typography
            component="h1"
            variant="h5"
            fontWeight="bold"
            mb={3}
            color="primary"
          >
            BizSync
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleLogin}
            sx={{ mt: 1, width: "100%" }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="이메일 주소"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="비밀번호"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: "bold",
              }}
            >
              로그인
            </Button>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => setSignupOpen(true)}
              sx={{
                mb: 2,
                py: 1.5,
                fontSize: "1rem",
              }}
            >
              회원가입
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* 회원가입 다이얼로그 섹션 */}
      <Dialog open={signupOpen} onClose={handleSignupDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>회원가입</DialogTitle>
        <DialogContent>
          {signupSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              회원가입 성공! 관리자 승인을 기다려주세요.
            </Alert>
          )}
          {signupError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {signupError}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSignup} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="signup-email"
              label="이메일 주소"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="비밀번호"
              type="password"
              id="signup-password"
              autoComplete="new-password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="signup-name"
              label="이름"
              name="name"
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
            />
            <TextField
              margin="normal"
              fullWidth
              id="signup-empno"
              label="사번 (선택)"
              name="empNo"
              value={signupEmpNo}
              onChange={(e) => setSignupEmpNo(e.target.value)}
            />
            <TextField
              margin="normal"
              fullWidth
              id="signup-department"
              label="부서 (선택)"
              name="department"
              value={signupDepartment}
              onChange={(e) => setSignupDepartment(e.target.value)}
            />
            <DialogActions sx={{ px: 0, pt: 2 }}>
              <Button onClick={handleSignupDialogClose}>취소</Button>
              <Button type="submit" variant="contained">
                가입하기
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      {/* 알림 섹션 */}
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => closeToast(setToast)}
      />
    </Box>
  );
};

export default LoginPage;
