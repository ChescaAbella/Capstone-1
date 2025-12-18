import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerificationPage } from './pages/VerificationPage';
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
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" />;
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
          <ProtectedRoute requiredRole="ADMIN">
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

      {/* Member Routes */}
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
        path="/member/history"
        element={
          <ProtectedRoute requiredRole="MEMBER">
            <HistoryPage />
          </ProtectedRoute>
        }
      />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

// Dashboard Router Component
function DashboardRouter() {
  const { user } = useAuth();

  if (user?.role === 'MEMBER') {
    return <MemberDashboard />;
  } else if (user?.role === 'MANAGER') {
    return <ManagerDashboard />;
  } else if (user?.role === 'ADMIN') {
    return <AdminDashboard />;
  }

  return <Navigate to="/" />;
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
