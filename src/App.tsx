import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import LoginForm from './components/auth/LoginForm'
import RegisterForm from './components/auth/RegisterForm'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Breathe from './pages/Breathe'
import Hydration from './pages/Hydration'
import Mood from './pages/Mood'
import Steps from './pages/Steps'
import Journal from './pages/Journal'

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pastel-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pastel-purple-deep"></div>
      </div>
    )
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />
}

// Public Route Component (redirect to dashboard if logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pastel-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pastel-purple-deep"></div>
      </div>
    )
  }
  
  return user ? <Navigate to="/dashboard" /> : <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="font-inter">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginForm />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterForm />
                </PublicRoute>
              }
            />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="breathe" element={<Breathe />} />
              <Route path="hydration" element={<Hydration />} />
              <Route path="mood" element={<Mood />} />
              <Route path="steps" element={<Steps />} />
              <Route path="journal" element={<Journal />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App