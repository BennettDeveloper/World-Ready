import { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import LandingPage from './pages/LandingPage'
import InterviewScreen from './pages/InterviewScreen'
import ResultsScreen from './pages/ResultsScreen'
import ProfilePage from './pages/ProfilePage'
import LeaderboardPage from './pages/LeaderboardPage'
import ReviewsPage from './pages/ReviewsPage'
import { getSession, login, register } from './utils/auth'

const DEMO_MODE = true

function ensureDemoUser() {
  const result = login({ username: 'demo', password: 'worldready' })
  if (!result.success) {
    register({ username: 'demo', password: 'worldready', name: 'Demo User', email: 'demo@worldready.ai' })
    return login({ username: 'demo', password: 'worldready' }).user
  }
  return result.user
}

function ProtectedRoute({ children, user }) {
  return user ? children : <Navigate to="/" replace />
}

function PublicRoute({ children, user }) {
  return !user ? children : <Navigate to="/home" replace />
}

export default function App() {
  const [user, setUser] = useState(() => DEMO_MODE ? ensureDemoUser() : getSession())
  const [sessionData, setSessionData] = useState(null)
  const location = useLocation()
  const hideNav = ['/', '/register'].includes(location.pathname)

  return (
    <div className="app">
      {!hideNav && user && <Navbar user={user} onLogout={() => setUser(null)} />}
      <main className={`main-content${hideNav ? ' no-nav' : ''}`}>
        <Routes>
          <Route path="/" element={<PublicRoute user={user}><LoginPage onLogin={setUser} /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute user={user}><RegisterPage onLogin={setUser} /></PublicRoute>} />
          <Route path="/home" element={<ProtectedRoute user={user}><LandingPage user={user} /></ProtectedRoute>} />
          <Route path="/interview" element={<ProtectedRoute user={user}><InterviewScreen onComplete={data => setSessionData(data)} /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute user={user}><ResultsScreen user={user} sessionData={sessionData} /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute user={user}><ProfilePage user={user} /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute user={user}><LeaderboardPage user={user} /></ProtectedRoute>} />
          <Route path="/reviews" element={<ProtectedRoute user={user}><ReviewsPage user={user} /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={user ? '/home' : '/'} replace />} />
        </Routes>
      </main>
    </div>
  )
}