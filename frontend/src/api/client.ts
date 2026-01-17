import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // 토큰 만료 시
      console.error("인증 실패! 로그인이 필요합니다.");
      // 로그인페이지로 리다이렉트
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default client;
