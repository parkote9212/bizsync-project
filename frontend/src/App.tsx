import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import KanbanBoardPage from "./pages/KanbanBoardPage";
import LoginPage from "./pages/LoginPage";
import ProjectListPage from "./pages/ProjectListPage";
import ApprovalPage from "./pages/ApprovalPage";
import OrganizationPage from "./pages/OrganizationPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminUserManagementPage from "./pages/AdminUserManagementPage";
import { ErrorBoundary } from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
      <Routes>
        {/* 기본 경로 접속 시 대시보드로 리다이렉트 (로그인 후) */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<LoginPage />} />

        {/* 인증이 필요한 라우트 - Layout 적용 */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* 기본 대시보드 */}
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* 프로젝트 관리 */}
          <Route path="/projects" element={<ProjectListPage />} />
          <Route path="/projects/:projectId" element={<KanbanBoardPage />} />

          {/* 전자결재 */}
          <Route path="/approvals" element={<ApprovalPage />} />

          {/* 조직도 */}
          <Route path="/organization" element={<OrganizationPage />} />

          {/* 관리자 */}
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUserManagementPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
