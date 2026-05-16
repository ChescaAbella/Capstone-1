import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import './Sidebar.css';

const Sidebar = ({ role }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  // Navigation items based on role
  const navItems = {
    STUDENT: [
      { icon: '📊', label: 'Dashboard', path: '/dashboard', action: () => navigate('/dashboard') },
      { icon: '�', label: 'Assignments', path: '/student/assignments', action: () => navigate('/student/assignments') },
      { icon: '�📋', label: 'Deliverables', path: '/student/deliverables', action: () => navigate('/student/deliverables') },
      { icon: '📜', label: 'History', path: '/student/history', action: () => navigate('/student/history') },
    ],
    TEACHER: [
      { icon: '📊', label: 'Dashboard', path: '/dashboard', action: () => navigate('/dashboard') },
      { icon: '📋', label: 'Deliverables', path: '/deliverables', action: () => navigate('/deliverables') },
      { icon: '👥', label: 'Class Members', path: '/team', action: () => navigate('/team') },
      { icon: '📈', label: 'Analytics', path: '/analytics', action: () => navigate('/analytics') },
      { icon: '⚙️', label: 'Settings', path: '/settings', action: () => navigate('/settings') },
    ],
    ADMIN: [
      { icon: '📊', label: 'Dashboard', path: '/dashboard', action: () => navigate('/dashboard') },
      { icon: '👥', label: 'Users', path: '/users', action: () => navigate('/users') },
      { icon: '📈', label: 'Analytics', path: '/analytics', action: () => navigate('/analytics') },
      { icon: '⚙️', label: 'Settings', path: '/settings', action: () => navigate('/settings') },
      { icon: '🔒', label: 'Security', path: '/security', action: () => navigate('/security') },
    ],
  };

  const currentNavItems = navItems[role] || navItems.STUDENT;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>📦 DeliverEase</h2>
      </div>

      <nav className="sidebar-nav">
        {currentNavItems.map((item, index) => (
          <button
            key={index}
            className="sidebar-item"
            onClick={item.action}
            title={item.label}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {user && (
        <div className="sidebar-footer">
          <div className="profile-card">
            <div className="profile-picture">
              {user.pictureUrl ? (
                <img src={user.pictureUrl} alt={user.name} />
              ) : (
                <div className="profile-placeholder">👤</div>
              )}
            </div>
            <div className="profile-info">
              <p className="user-name">{user.name}</p>
              <p className="user-role">{user.role}</p>
            </div>
            <button
              className="profile-settings-btn"
              onClick={handleProfileClick}
              title="Edit profile"
            >
              ⚙️
            </button>
          </div>
          <Button
            variant="ghost"
            fullWidth
            size="sm"
            onClick={handleLogout}
            className="logout-btn"
          >
            🚪 Logout
          </Button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
