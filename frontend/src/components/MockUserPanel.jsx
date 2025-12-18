import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/MockUserPanel.css';

const MockUserPanel = () => {
  const { setMockUser, user } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (role) => {
    setMockUser(role);
    // Redirect to dashboard after role change
    navigate('/dashboard');
  };

  return (
    <div className="mock-user-panel">
      <div className="mock-user-title">🧪 Mock User (Dev Only)</div>
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
      {user && (
        <div className="mock-user-info">
          <small>Logged in as: <strong>{user.name}</strong></small>
          <small>Role: <strong>{user.role}</strong></small>
        </div>
      )}
    </div>
  );
};

export default MockUserPanel;
