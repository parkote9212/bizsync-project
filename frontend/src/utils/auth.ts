/**
 * 인증 관련 유틸리티 함수
 */

/**
 * localStorage에서 액세스 토큰 가져오기
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

/**
 * localStorage에서 리프레시 토큰 가져오기
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

/**
 * 토큰 저장
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

/**
 * 토큰 제거 (로그아웃)
 */
export const clearTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

/**
 * 사용자 인증 여부 확인
 */
export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  if (!token) {
    return false;
  }

  // JWT 토큰 만료 여부 체크 (선택적)
  try {
    const payload = parseJwt(token);
    const currentTime = Date.now() / 1000;

    // exp (만료 시간)이 현재 시간보다 이후면 유효
    if (payload.exp && payload.exp > currentTime) {
      return true;
    }

    // 토큰이 만료되었으면 제거
    clearTokens();
    return false;
  } catch (error) {
    // 토큰 파싱 실패 시 제거
    clearTokens();
    return false;
  }
};

/**
 * JWT 토큰 파싱 (페이로드 추출)
 */
const parseJwt = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

/**
 * 현재 로그인한 사용자 ID 가져오기
 */
export const getCurrentUserId = (): number | null => {
  const token = getAccessToken();
  if (!token) {
    return null;
  }

  try {
    const payload = parseJwt(token);
    // JWT 토큰의 userId 또는 sub 필드에서 사용자 ID 추출
    return payload.userId || payload.sub || null;
  } catch (error) {
    console.error('Failed to get user ID from token:', error);
    return null;
  }
};

/**
 * 현재 로그인한 사용자 정보 가져오기 (JWT 토큰에서)
 */
export const getCurrentUserInfo = (): { userId: number | null; role: string | null } => {
  const token = getAccessToken();
  if (!token) {
    return { userId: null, role: null };
  }

  try {
    const payload = parseJwt(token);
    const userId = payload.userId || payload.sub || null;
    const role = payload.role || null;
    return {
      userId: userId ? Number(userId) : null,
      role,
    };
  } catch (error) {
    console.error('Failed to get user info from token:', error);
    return { userId: null, role: null };
  }
};