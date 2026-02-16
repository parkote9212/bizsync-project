/**
 * API 클라이언트 설정
 * Next.js API Routes (BFF)를 통해 백엔드와 통신
 */

import axios, { AxiosInstance } from 'axios';

// Next.js API Routes 기본 URL (BFF)
const API_BASE_URL = '/api';

/** 동시 401 시 한 번만 refresh 시도하기 위한 공유 Promise */
let refreshPromise: Promise<string> | null = null;

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request 인터셉터 - JWT 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    // 클라이언트 사이드에서만 localStorage 접근
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response 인터셉터 - 401 에러 처리 및 토큰 갱신
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // 이미 refresh 중이면 그 결과를 기다림 (한 번만 호출)
        if (!refreshPromise) {
          refreshPromise = (async () => {
            const response = await axios.post<{ data?: { accessToken: string } }>(
              `${API_BASE_URL}/auth/refresh`,
              { refreshToken }
            );
            const accessToken = response.data?.data?.accessToken ?? response.data?.accessToken;
            if (accessToken) {
              localStorage.setItem('accessToken', accessToken);
              return accessToken;
            }
            throw new Error('No access token in refresh response');
          })();
          refreshPromise.finally(() => {
            refreshPromise = null;
          });
        }

        const newAccessToken = await refreshPromise;

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
