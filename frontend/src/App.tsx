import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ChatTest from "./ChatTest"; // 아까 만든 채팅 테스트

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 기본 경로 접속 시 로그인 페이지로 리다이렉트 */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />

        {/* 로그인 후 이동할 임시 페이지 (나중에 프로젝트 목록으로 변경) */}
        <Route
          path="/projects"
          element={
            <div style={{ padding: 20 }}>
              <h1>메인 페이지입니다</h1>
              <p>로그인에 성공하셨군요!</p>
              <ChatTest /> {/* 채팅도 여기서 테스트 가능 */}
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
