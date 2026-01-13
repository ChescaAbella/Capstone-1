import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/MockUserPanel.css';

const MockUserPanel = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const { setMockUser, user } = useAuth();
  const navigate = useNavigate();

  // Only show mock user panel for admin users
  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  const handleRoleChange = (role) => {
    setMockUser(role);
    // Redirect to dashboard after role change
    navigate('/dashboard');
  };

  const handleGoToUsersPage = () => {
    navigate('/admin/users');
  };

  return (
    <div className={`mock-user-panel ${isMinimized ? 'minimized' : ''}`}>
      <div className="mock-user-title">
        <span>🧪 Mock User (Dev Only)</span>
        <button 
          className="minimize-btn"
          onClick={() => setIsMinimized(!isMinimized)}
          title={isMinimized ? 'Expand' : 'Minimize'}
        >
          {isMinimized ? '▶' : '▼'}
        </button>
      </div>
      {!isMinimized && (
        <>
          <div className="mock-user-buttons">
            <button 
              className={`mock-btn ${user?.role === 'MEMBER' ? 'active' : ''}`}
              onClick={() => handleRoleChange('member')}
            >
              Member
            </button>
            <button 
              className={`mock-btn ${user?.role === 'MANAGER' ? 'active' : ''}`}
              onClick={() => handleRoleChange('manager')}
            >
              Manager
            </button>
            <button 
              className={`mock-btn ${user?.role === 'ADMIN' ? 'active' : ''}`}
              onClick={() => handleRoleChange('admin')}
            >
              Admin
            </button>
          </div>
          <button 
            className="mock-users-btn"
            onClick={handleGoToUsersPage}
            title="Go to Users Management Page"
          >
            👥 Manage Users
          </button>
          {user && (
            <div className="mock-user-info">
              <small>Logged in as: <strong>{user.name}</strong></small>
              <small>Role: <strong>{user.role}</strong></small>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MockUserPanel;
