import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import client from "../api/client";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // 백엔드 로그인 API 호출
      // DTO: { email, password } -> LoginRequestDTO와 매칭
      const response = await client.post("/auth/login", {
        email,
        password,
      });

      // 성공 시: 토큰 저장
      const { accessToken, refreshToken } = response.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // 메인 페이지(프로젝트 목록)로 이동
      alert("로그인 성공!");
      navigate("/projects");
    } catch (err: any) {
      console.error(err);
      setError("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
    }
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
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
