import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerificationPage } from './pages/VerificationPage';
import { AuthCallback } from './pages/AuthCallback';
import { ProfilePage } from './pages/Profile/ProfilePage';
import { AdminPanel } from './pages/AdminPanel';
import MemberDashboard from './pages/Dashboard/MemberDashboard';
import ManagerDashboard from './pages/Dashboard/ManagerDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import MemberDeliverablesPage from './pages/Member/Deliverables';
import DeliverableSubmitPage from './pages/Member/DeliverableSubmit';
import HistoryPage from './pages/Member/History';
import MockUserPanel from './components/MockUserPanel';
import './styles/global.css';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard if wrong role
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify" element={<VerificationPage />} />
      
      {/* OAuth Callback Route - IMPORTANT! */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="ADVISER">
            <AdminPanel />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        }
      />

      {/* Member Routes - Changed role from MEMBER to STUDENT */}
      <Route
        path="/dashboard/member"
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <MemberDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/member/deliverables"
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <MemberDeliverablesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/member/deliverables/:id"
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <DeliverableSubmitPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/member/history"
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <HistoryPage />
          </ProtectedRoute>
        }
      />

      {/* Manager Routes - Changed role from MANAGER to LEADER */}
      <Route
        path="/dashboard/manager"
        element={
          <ProtectedRoute requiredRole="LEADER">
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes - Changed role from ADMIN to ADVISER */}
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute requiredRole="ADVISER">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Dashboard Router Component - Updated to match backend roles
function DashboardRouter() {
  const { user } = useAuth();

  // Map backend roles to frontend dashboards
  if (user?.role === 'STUDENT') {
    return <Navigate to="/dashboard/member" replace />;
  } else if (user?.role === 'LEADER') {
    return <Navigate to="/dashboard/manager" replace />;
  } else if (user?.role === 'ADVISER') {
    return <Navigate to="/dashboard/admin" replace />;
  }

  return <Navigate to="/" replace />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <MockUserPanel />
      </AuthProvider>
    </Router>
  );
}

export default App;