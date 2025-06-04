import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/home/Home';
import CentralClub from './pages/club/CentralClub';
import CentralClubDetail from './pages/club/CentralClubDetail';
import CentralClubEdit from './pages/club/CentralClubEdit'; // 새로 추가
import DepartmentClub from './pages/club/DepartmentClub';
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
        <Route path="/club/central" element={<CentralClub />} />
        <Route path="/club/central/:clubId" element={<CentralClubDetail />} />
        <Route path="/club/central/:clubId/edit" element={<CentralClubEdit />} /> {/* 편집 라우트 추가 */}
        <Route path="/club/department" element={<DepartmentClub />} />
      </Routes>
    </Router>
  );
}

export default App;