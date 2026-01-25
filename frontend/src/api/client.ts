import axios from "axios";

/**
 * API 기본 URL
 * 환경 변수 VITE_API_BASE_URL이 설정되어 있으면 사용하고, 없으면 기본값 사용
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

/**
 * Axios 인스턴스 생성
 *
 * <p>모든 API 요청에 공통으로 적용될 설정을 포함합니다.
 * - baseURL: API 서버 주소
 * - headers: 기본 Content-Type 설정
 */
const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * 요청 인터셉터
 *
 * <p>모든 API 요청 전에 실행되며, localStorage에서 액세스 토큰을 가져와
 * Authorization 헤더에 추가합니다.
 */
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * 인증 실패 시 사용자 데이터를 초기화하는 함수
 *
 * <p>401 에러 발생 시 localStorage의 모든 사용자 관련 데이터를 제거합니다.
 */
const clearUserDataOnAuthFailure = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user-storage");
  localStorage.removeItem("notification-storage");
  localStorage.removeItem("project-storage");
};

/**
 * 응답 인터셉터
 *
 * <p>API 응답을 처리합니다:
 * - 성공 응답: 백엔드에서 { success, data } 형태로 감싼 경우 data만 추출
 * - 에러 응답: 401 에러 발생 시 로그인 페이지로 리다이렉트
 */
client.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      return {
        ...response,
        data: response.data.data,
        originalResponse: response.data
      };
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("인증 실패! 로그인이 필요합니다.");
      clearUserDataOnAuthFailure();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

/**
 * API 클라이언트 인스턴스
 *
 * <p>모든 API 호출에 사용되는 axios 인스턴스입니다.
 * 요청/응답 인터셉터가 설정되어 있어 자동으로 인증 토큰을 추가하고
 * 에러를 처리합니다.
 */
export default client;
