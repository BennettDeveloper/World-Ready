import { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import PublicLandingPage from './pages/PublicLandingPage';
import InterviewScreen from './pages/InterviewScreen';
import ResultsScreen from './pages/ResultsScreen';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import ReviewsPage from './pages/ReviewsPage';
import AboutPage from './pages/AboutPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import { getSession } from './utils/auth';
import './App.css';

function ProtectedRoute({ children, user }) {
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [user, setUser] = useState(() => getSession());
  const [sessionData, setSessionData] = useState(null);
  const location = useLocation();

  const hideNav = ['/', '/login', '/register'].includes(location.pathname);

  function handleLogin(u) { setUser(u); }
  function handleLogout() { setUser(null); }

  return (
    <div className="app">
      {!hideNav && user && <Navbar user={user} onLogout={handleLogout} />}

      <main className={`main-content${hideNav ? ' no-nav' : ''}`}>
        <Routes>
          <Route path="/" element={<PublicLandingPage user={user} />} />
          <Route path="/login" element={
            user ? <Navigate to="/home" replace /> : <LoginPage onLogin={handleLogin} />
          } />
          <Route path="/register" element={
            user ? <Navigate to="/home" replace /> : <RegisterPage onLogin={handleLogin} />
          } />
          <Route path="/home" element={
            <ProtectedRoute user={user}>
              <LandingPage user={user} />
            </ProtectedRoute>
          } />
          <Route path="/interview" element={
            <ProtectedRoute user={user}>
              <InterviewScreen onComplete={data => setSessionData(data)} />
            </ProtectedRoute>
          } />
          <Route path="/results" element={
            <ProtectedRoute user={user}>
              <ResultsScreen user={user} sessionData={sessionData} />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute user={user}>
              <ProfilePage user={user} />
            </ProtectedRoute>
          } />
          <Route path="/leaderboard" element={
            <ProtectedRoute user={user}>
              <LeaderboardPage user={user} />
            </ProtectedRoute>
          } />
          <Route path="/reviews" element={
            <ProtectedRoute user={user}>
              <ReviewsPage user={user} />
            </ProtectedRoute>
          } />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="*" element={<Navigate to={user ? '/home' : '/'} replace />} />
        </Routes>
      </main>
    </div>
  );
}
