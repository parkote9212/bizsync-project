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

// 401 시 클라이언트의 사용자별 데이터 제거 (이전 세션 노출 방지)
const clearUserDataOnAuthFailure = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user-storage");
  localStorage.removeItem("notification-storage");
  localStorage.removeItem("project-storage");
};

// 응답 인터셉터
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("인증 실패! 로그인이 필요합니다.");
      clearUserDataOnAuthFailure();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default client;
