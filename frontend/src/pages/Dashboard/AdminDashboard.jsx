import { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import { Card, CardBody } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Table } from '../../components/Table';
import { Modal } from '../../components/Modal';
import { Input, Select } from '../../components/Input';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [showAddUser, setShowAddUser] = useState(false);

  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'MEMBER', status: 'active', joinDate: '2025-01-01' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'MANAGER', status: 'active', joinDate: '2025-01-02' },
    { id: 3, name: 'Admin User', email: 'admin@example.com', role: 'ADMIN', status: 'active', joinDate: '2024-12-01' },
    { id: 4, name: 'Bob Johnson', email: 'bob@example.com', role: 'MEMBER', status: 'inactive', joinDate: '2025-01-03' },
  ];

  const systemStats = [
    { id: 1, name: 'Total Users', value: '150', icon: '👥' },
    { id: 2, name: 'Active Sessions', value: '45', icon: '🔗' },
    { id: 3, name: 'Total Submissions', value: '2,450', icon: '📤' },
    { id: 4, name: 'System Uptime', value: '99.9%', icon: '⚡' },
  ];

  const activityLog = [
    { id: 1, action: 'User Registration', user: 'New User', timestamp: '5 mins ago', type: 'success' },
    { id: 2, action: 'Project Created', user: 'Project Manager', timestamp: '2 hours ago', type: 'success' },
    { id: 3, action: 'Submission Uploaded', user: 'John Doe', timestamp: '3 hours ago', type: 'success' },
    { id: 4, action: 'User Deactivated', user: 'Bob Johnson', timestamp: '1 day ago', type: 'warning' },
  ];

  const userColumns = [
    { key: 'name', label: 'Name', width: '20%' },
    { key: 'email', label: 'Email', width: '25%' },
    {
      key: 'role',
      label: 'Role',
      width: '15%',
      render: (role) => (
        <Badge variant={role === 'ADMIN' ? 'danger' : role === 'MANAGER' ? 'warning' : 'info'}>
          {role}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '15%',
      render: (status) => (
        <Badge variant={status === 'active' ? 'success' : 'default'}>
          {status}
        </Badge>
      ),
    },
    { key: 'joinDate', label: 'Join Date', width: '20%' },
  ];

  const activityColumns = [
    { key: 'action', label: 'Action', width: '25%' },
    { key: 'user', label: 'User', width: '25%' },
    { key: 'timestamp', label: 'Time', width: '25%' },
    {
      key: 'type',
      label: 'Type',
      width: '25%',
      render: (type) => (
        <Badge variant={type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'info'}>
          {type}
        </Badge>
      ),
    },
  ];

  return (
    <DashboardLayout role="ADMIN">
      <div className="welcome-section">
        <h1>Welcome, {user?.name?.split(' ')[0]}! 👋</h1>
        <p>System overview and management tools</p>
      </div>

        {/* System Stats */}
        <div className="stats-grid">
          {systemStats.map((stat) => (
            <Card key={stat.id}>
              <CardBody className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.name}</div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Action Bar */}
        <div className="action-bar">
          <Button variant="primary" onClick={() => setShowAddUser(true)}>
            + Add User
          </Button>
          <Button variant="secondary">
            Generate Report
          </Button>
        </div>

        {/* Users Management */}
        <div className="dashboard-section">
          <h2>👥 User Management</h2>
          <Table columns={userColumns} data={users} />
        </div>

        {/* Activity Log */}
        <div className="dashboard-section">
          <h2>📋 Activity Log</h2>
          <Table columns={activityColumns} data={activityLog} />
        </div>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddUser}
        title="Add New User"
        onClose={() => setShowAddUser(false)}
        size="md"
      >
        <form className="user-form">
          <Input label="Full Name" placeholder="John Doe" fullWidth />
          <Input label="Email" type="email" placeholder="john@example.com" fullWidth />
          <Input label="Password" type="password" placeholder="••••••••" fullWidth />
          <Select
            label="Role"
            options={[
              { value: 'MEMBER', label: 'Member' },
              { value: 'MANAGER', label: 'Manager' },
              { value: 'ADMIN', label: 'Admin' },
            ]}
            fullWidth
          />
          <div className="modal-actions">
            <Button variant="primary" fullWidth>
              Create User
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setShowAddUser(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminDashboard;
