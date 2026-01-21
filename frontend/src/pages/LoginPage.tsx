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

const LoginPage = () => {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  // 회원가입 관련 상태
  const [signupOpen, setSignupOpen] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmpNo, setSignupEmpNo] = useState("");
  const [signupDepartment, setSignupDepartment] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // 백엔드 로그인 API 호출
      // DTO: { email, password } -> LoginRequestDTO와 매칭
      const response = await client.post<{
        accessToken: string;
        refreshToken: string;
        userId: number;
        name: string;
        email: string;
        role: string;
      }>("/auth/login", {
        email,
        password,
      });

      // 성공 시: 토큰 저장
      const { accessToken, refreshToken, userId, name: userName, email: userEmail, role } = response.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // 사용자 정보를 Zustand 스토어에 저장 (persist 미들웨어로 localStorage 자동 동기화)
      setUser({
        userId: userId || null,
        name: userName || null,
        email: userEmail || null,
        role: role || null,
      });

      // 대시보드로 이동
      alert("로그인 성공!");
      navigate("/dashboard");
    } catch (err: unknown) {
      console.error(err);
      setError("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");
    setSignupSuccess(false);

    try {
      // 백엔드 회원가입 API 호출
      // DTO: { email, password, name, empNo, department } -> SignumRequestDTO와 매칭
      await client.post("/auth/signup", {
        email: signupEmail,
        password: signupPassword,
        name: signupName,
        empNo: signupEmpNo || undefined,
        department: signupDepartment || undefined,
      });

      setSignupSuccess(true);
      // 회원가입 성공 시 폼 초기화 및 다이얼로그 닫기
      setTimeout(() => {
        setSignupOpen(false);
        setSignupEmail("");
        setSignupPassword("");
        setSignupName("");
        setSignupEmpNo("");
        setSignupDepartment("");
        setSignupSuccess(false);
        alert("회원가입 성공! 로그인해주세요.");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "회원가입에 실패했습니다. 다시 시도해주세요.";
      setSignupError(errorMessage);
    }
  };

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

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center", // 가로 중앙
        alignItems: "center", // 세로 중앙
        minHeight: "100vh", // 화면 전체 높이 사용
        backgroundColor: "#f5f5f5", // (선택) 배경색을 연한 회색으로 줘서 카드 강조
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={6} // 그림자 효과를 좀 더 강하게 (3 -> 6)
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: 2, // 모서리 둥글게
          }}
        >
          {/* 아이콘이나 로고가 있다면 여기에 추가 가능 */}
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
              size="large" // 버튼 크기 키움
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

      {/* 회원가입 다이얼로그 */}
      <Dialog open={signupOpen} onClose={handleSignupDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>회원가입</DialogTitle>
        <DialogContent>
          {signupSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              회원가입 성공!
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
    </Box>
  );
};

export default LoginPage;
