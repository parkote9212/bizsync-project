import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProjectListPage from "./pages/ProjectListPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 기본 경로 접속 시 로그인 페이지로 리다이렉트 */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/projects" element={<ProjectListPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
