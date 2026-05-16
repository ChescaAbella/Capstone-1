import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerificationPage } from './pages/VerificationPage';
import { ProfilePage } from './pages/Profile/ProfilePage';
import { AdminPanel } from './pages/AdminPanel';
import StudentDashboard from './pages/Dashboard/StudentDashboard';
import TeacherDashboard from './pages/Dashboard/TeacherDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import StudentDeliverablesPage from './pages/Student/Deliverables';
import DeliverableSubmitPage from './pages/Student/DeliverableSubmit';
import HistoryPage from './pages/Student/History';
import AssignmentsPage from './pages/Student/Assignments';
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

      {/* Student Routes */}
      <Route
        path="/student/assignments"
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <AssignmentsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/deliverables"
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <StudentDeliverablesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/deliverables/:id"
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <DeliverableSubmitPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/history"
        element={
          <ProtectedRoute requiredRole="STUDENT">
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

  if (user?.role === 'STUDENT') {
    return <StudentDashboard />;
  } else if (user?.role === 'TEACHER') {
    return <TeacherDashboard />;
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
