import './Layout.css';
import { Navbar } from './Navbar';

export const DashboardLayout = ({ 
  children, 
  navItems = [], 
  sidebarItems = [],
  userRole = '',
  userName = '',
  userPicture = '',
  onLogout = null
}) => {
  return (
    <div className="dashboard-layout">
      <Navbar 
        brandName="DeliverEase" 
        navItems={navItems}
        userRole={userRole}
        onLogout={onLogout}
      />
      <div className="dashboard-container">
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
};

export const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        {children}
      </div>
    </div>
  );
};

export const Container = ({ children, className = '' }) => {
  return (
    <div className={`container ${className}`}>
      {children}
    </div>
  );
};
