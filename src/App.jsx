import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/home/Home';
import CentralClub from './pages/club/CentralClub';
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
      </Routes>
    </Router>
  );
}

export default App;