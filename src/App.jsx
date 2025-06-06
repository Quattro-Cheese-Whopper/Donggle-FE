import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/home/Home';
import CentralClub from './pages/club/CentralClub';
import DepartmentClub from './pages/club/DepartmentClub';
import ClubDetail from './pages/club/ClubDetail'; // 🔧 통합된 상세 페이지
import ClubEdit from './pages/club/ClubEdit'; // 🔧 통합된 편집 페이지
import SignIn from './pages/sign/signin';
import SignUp from './pages/sign/signup';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* 동아리 목록 페이지 (기존 유지) */}
        <Route path="/club/central" element={<CentralClub />} />
        <Route path="/club/department" element={<DepartmentClub />} />
        
        {/* 🔧 통합된 동아리 상세/편집 페이지 */}
        <Route path="/club/:clubType/:clubId" element={<ClubDetail />} />
        <Route path="/club/:clubType/:clubId/edit" element={<ClubEdit />} />
      </Routes>
    </Router>
  );
}

export default App;