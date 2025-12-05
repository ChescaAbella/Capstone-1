import { Link } from 'react-router-dom';
import './Navbar.css';

export const Navbar = ({ brandName = 'AI Tracker', navItems = [], userRole = null, onLogout = null }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="navbar-brand-icon">🤖</span>
          {brandName}
        </Link>
        
        <div className="navbar-menu">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`navbar-item ${item.active ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        
        <div className="navbar-actions">
          {userRole && <span className="user-badge">{userRole}</span>}
          {onLogout && (
            <button className="navbar-logout" onClick={onLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
