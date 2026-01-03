import './App.css'
import { Routes, Route, Navigate } from "react-router-dom";
import FloatingNavbar from './components/FloatingNavbar';

import SquareAwayLanding from './components/SquareAwayLanding'
import OGLanding from './components/OGLanding'
import Questions from './components/Questions';
import Practice from './components/Practice';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import TeacherDashboard from './components/TeacherDashboard';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AuthRoot = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;

  // Redirect based on role
  if (user) {
    const isTeacher = user.user_metadata?.role === 'teacher';
    return isTeacher ? <Navigate to="/teacher-dashboard" replace /> : <SquareAwayLanding />;
  }

  return <OGLanding />;
};

function App() {
  const { user } = useAuth();

  return (
    <div className="App relative bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Navbar is fixed - only show if logged in? Or always? User didn't specify, but usually dashboard has navbar. */}
      {user && <FloatingNavbar />}

      {/* Padding ensures content starts below the navbar if it exists */}
      <div className="">
        <Routes>
          <Route path="/" element={<AuthRoot />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          <Route path="/teacher-dashboard" element={
            <ProtectedRoute>
              <TeacherDashboard />
            </ProtectedRoute>
          } />

          <Route path="/questions/:topic" element={
            <ProtectedRoute>
              <Questions />
            </ProtectedRoute>
          } />
          <Route path="/practice" element={
            <ProtectedRoute>
              <Practice />
            </ProtectedRoute>
          } />
          {/* Library Route - Redirects to Landing/Home where notes are */}
          <Route path="/library" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}


export default App;
