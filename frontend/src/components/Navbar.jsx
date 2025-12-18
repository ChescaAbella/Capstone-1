import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Navbar.css';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          📦 DeliverEase
        </Link>
        <div className="navbar-menu">
          {user && (
            <>
              <span className="navbar-user">Welcome, {user.name || user.email}</span>
              <button onClick={logout} className="navbar-logout">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
