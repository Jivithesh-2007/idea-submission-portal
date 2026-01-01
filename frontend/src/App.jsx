import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/useAuth'
import { useTheme } from './context/ThemeContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import StudentDashboard from './pages/StudentDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import SubmitIdea from './pages/SubmitIdea'
import './App.css'

function App() {
  const { user, loading } = useAuth()
  const { isDarkMode } = useTheme()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
        color: isDarkMode ? '#e0e0e0' : '#1f2937',
        fontSize: '18px'
      }}>
        Loading ClassForge...
      </div>
    )
  }

  return (
    <div data-theme={isDarkMode ? 'dark' : 'light'}>
      <BrowserRouter>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* PROTECTED ROUTES - FACULTY */}
          <Route 
            path="/teacher-dashboard" 
            element={user?.role === 'faculty' ? <TeacherDashboard /> : <Navigate to="/login" />} 
          />

          {/* PROTECTED ROUTES - STUDENT */}
          <Route 
            path="/student-dashboard" 
            element={user?.role === 'student' ? <StudentDashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/submit-idea" 
            element={user?.role === 'student' ? <SubmitIdea /> : <Navigate to="/login" />} 
          />

          {/* DEFAULT ROUTES */}
          <Route 
            path="/" 
            element={
              user ? (
                user.role === 'faculty' ? (
                  <Navigate to="/teacher-dashboard" />
                ) : (
                  <Navigate to="/student-dashboard" />
                )
              ) : (
                <Navigate to="/login" />
              )
            } 
          />

          {/* CATCH ALL - Go to login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
