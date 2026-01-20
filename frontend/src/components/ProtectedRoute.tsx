import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 인증이 필요한 페이지를 보호하는 컴포넌트
 * - 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
 * - 인증된 사용자는 요청한 페이지 렌더링
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  if (!isAuthenticated()) {
    // 인증되지 않은 경우 로그인 페이지로 리다이렉트
    return <Navigate to="/login" replace />;
  }

  // 인증된 경우 children 렌더링
  return <>{children}</>;
};

export default ProtectedRoute;
