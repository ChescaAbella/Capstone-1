import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerificationPage } from './pages/VerificationPage';
import { VerifyEmailPage } from './pages/VerifyEmail';
import { VerificationPendingPage } from './pages/VerificationPending';
import { AuthCallback } from './pages/AuthCallback';
import { EnhancedProfilePage } from './pages/Profile/EnhancedProfilePage';
import { AdminPanel } from './pages/AdminPanel';
import { AdminUsersPanel } from './pages/Admin/AdminUsersPanel';
import AdminAuditLogs from './pages/Admin/AdminAuditLogs';
import MemberDashboard from './pages/Dashboard/MemberDashboard';
import ManagerDashboard from './pages/Dashboard/ManagerDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import MemberDeliverablesPage from './pages/Member/Deliverables';
import DeliverableSubmitPage from './pages/Member/DeliverableSubmit';
import ManagerDeliverablesPage from './pages/Manager/ManagerDeliverables';
import HistoryPage from './pages/Member/History';
import GanttChartPage from './pages/Project/GanttChart';
import MockUserPanel from './components/MockUserPanel';
import './styles/global.css';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Fallback to stored role in case user state hasn't hydrated yet
  const storedRole = localStorage.getItem('userRole');

  const normalizedUserRole = (user?.role || storedRole)
    ? (user?.role || storedRole).replace(/^ROLE_/i, '').toUpperCase()
    : undefined;
  const normalizedRequiredRole = requiredRole?.toUpperCase();

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

  console.log('🔍 ProtectedRoute check:', { isAuthenticated, hasUser: !!user, requiredRole: normalizedRequiredRole, userRole: normalizedUserRole });

  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (normalizedRequiredRole && normalizedUserRole !== normalizedRequiredRole) {
    console.log('❌ Wrong role, redirecting to dashboard');
    // Redirect to appropriate dashboard if wrong role
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log('✅ Access granted');
  return children;
};

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify" element={<VerificationPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/verification-pending" element={<VerificationPendingPage />} />
      
      {/* OAuth Callback Route - IMPORTANT! */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <EnhancedProfilePage />
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
        path="/admin/users"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminUsersPanel />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/audit-logs"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminAuditLogs />
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
          <ProtectedRoute requiredRole="MEMBER">
            <MemberDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/member/deliverables"
        element={
          <ProtectedRoute requiredRole="MEMBER">
            <MemberDeliverablesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/member/deliverables/:id"
        element={
          <ProtectedRoute requiredRole="MEMBER">
            <DeliverableSubmitPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/deliverables"
        element={
          <ProtectedRoute requiredRole="MANAGER">
            <ManagerDeliverablesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/project/gantt"
        element={
          <ProtectedRoute requiredRole="MANAGER">
            <GanttChartPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/member/history"
        element={
          <ProtectedRoute requiredRole="MEMBER">
            <HistoryPage />
          </ProtectedRoute>
        }
      />

      {/* Manager Routes - Changed role from MANAGER to LEADER */}
      <Route
        path="/dashboard/manager"
        element={
          <ProtectedRoute requiredRole="MANAGER">
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes - Changed role from ADMIN to ADVISER */}
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute requiredRole="ADMIN">
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
  const storedRole = localStorage.getItem('userRole');
  const roleSource = user?.role || storedRole;
  const role = roleSource ? roleSource.replace(/^ROLE_/i, '').toUpperCase() : undefined;

  // Map backend roles to frontend dashboards
  if (role === 'MEMBER') {
    return <Navigate to="/dashboard/member" replace />;
  } else if (role === 'MANAGER') {
    return <Navigate to="/dashboard/manager" replace />;
  } else if (role === 'ADMIN') {
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