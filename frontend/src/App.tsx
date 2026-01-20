import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import KanbanBoardPage from "./pages/KanbanBoardPage";
import LoginPage from "./pages/LoginPage";
import ProjectListPage from "./pages/ProjectListPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 기본 경로 접속 시 로그인 페이지로 리다이렉트 */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />

        {/* 인증이 필요한 라우트 */}
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute>
              <KanbanBoardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
