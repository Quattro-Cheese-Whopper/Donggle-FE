import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Home from "./pages/home/Home";
import CentralClub from "./pages/club/CentralClub";
import CentralClubDetail from "./pages/club/CentralClubDetail";
import CentralClubEdit from "./pages/club/CentralClubEdit"; // 새로 추가
import DepartmentClub from "./pages/club/DepartmentClub";
import SignIn from "./pages/sign/signin";
import SignUp from "./pages/sign/signup";
import ChatButton from "./components/chat/ChatButton";
import ChatWindow from "./components/chat/ChatWindow";
import useChat from "./hooks/useChat";
import { useState, useCallback, useEffect } from "react";

function AppInner() {
  const [chatOpen, setChatOpen] = useState(false);
  const { messages, loading, error, sendMessage, openChat, closeChat } =
    useChat();
  const location = useLocation();

  // 라우트 변경 시 채팅 자동 종료
  useEffect(() => {
    if (chatOpen) {
      setChatOpen(false);
      closeChat();
    }
    // eslint-disable-next-line
  }, [location.pathname]);

  const handleOpen = useCallback(async () => {
    await openChat();
    setChatOpen(true);
  }, [openChat]);

  const handleClose = useCallback(async () => {
    setChatOpen(false);
    await closeChat();
  }, [closeChat]);

  const handleSend = async (msg) => {
    await sendMessage(msg);
  };

  return (
    <>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/club/central" element={<CentralClub />} />
        <Route path="/club/central/:clubId" element={<CentralClubDetail />} />
        <Route
          path="/club/central/:clubId/edit"
          element={<CentralClubEdit />}
        />{" "}
        {/* 편집 라우트 추가 */}
        <Route path="/club/department" element={<DepartmentClub />} />
      </Routes>
      <ChatButton onClick={handleOpen} />
      <ChatWindow
        open={chatOpen}
        onClose={handleClose}
        messages={messages}
        onSend={handleSend}
        loading={loading}
        error={error}
      />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  );
}

export default App;
