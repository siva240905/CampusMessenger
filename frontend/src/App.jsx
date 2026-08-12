import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import Clients from './pages/Clients';
import Analytics from './pages/Analytics';

import StudentApp from './pages/StudentApp';
import DownloadPage from './pages/DownloadPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  // Detect if deployed for Student (e.g. Vercel, VITE_APP_MODE === 'student', or hostname contains 'vercel' or 'student')
  const isStudentMode = 
    import.meta.env.VITE_APP_MODE === 'student' || 
    (typeof window !== 'undefined' && (
      window.location.hostname.includes('vercel.app') || 
      window.location.hostname.includes('student')
    ));

  return (
    <Routes>
      {/* Student Portal Routes */}
      <Route path="/student" element={<StudentApp />} />
      <Route path="/download" element={<DownloadPage />} />
      <Route path="/install" element={<DownloadPage />} />

      {/* Faculty Admin Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/faculty" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <Clients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />

      {/* Root Route: Student Portal on Vercel, Faculty Admin Dashboard on Render */}
      <Route
        path="/"
        element={
          isStudentMode ? (
            <StudentApp />
          ) : (
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <AppRoutes />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}
