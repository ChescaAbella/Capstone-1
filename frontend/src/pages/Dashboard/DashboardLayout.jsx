import Sidebar from './Sidebar';
import './DashboardLayout.css';

const DashboardLayout = ({ children, role }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar role={role} />
      <main className="dashboard-content">{children}</main>
    </div>
  );
};

export default DashboardLayout;
