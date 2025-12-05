import { useState } from 'react';
import { DashboardLayout, Container } from '../components/Layout';
import { Card, CardBody, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { Input, Textarea, Select } from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: 'Project Kickoff',
      course: 'Website Redesign',
      dueDate: '2025-01-15',
      submissions: '28/30',
      status: 'closed',
    },
    {
      id: 2,
      title: 'Phase 2 Deliverables',
      course: 'Mobile App Dev',
      dueDate: '2025-01-20',
      submissions: '25/30',
      status: 'active',
    },
    {
      id: 3,
      title: 'Design Review',
      course: 'UI/UX Project',
      dueDate: '2025-01-25',
      submissions: '22/30',
      status: 'active',
    },
  ]);

  const students = [
    { id: 1, name: 'John Doe', email: 'john@example.com', submissions: 25, avgGrade: 'Excellent' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', submissions: 28, avgGrade: 'Outstanding' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', submissions: 20, avgGrade: 'Good' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarItems = [
    { icon: '📊', label: 'Dashboard', path: '/manager-dashboard', active: true },
    { icon: '📋', label: 'Deliverables', path: '/manager-dashboard', active: false },
    { icon: '👥', label: 'Team Members', path: '/manager-dashboard', active: false },
    { icon: '📈', label: 'Analytics', path: '/manager-dashboard', active: false },
    { icon: '⚙️', label: 'Settings', path: '/manager-dashboard', active: false },
  ];

  const navItems = [
    { label: 'Dashboard', path: '/manager-dashboard', active: true },
    { label: 'Deliverables', path: '/manager-dashboard', active: false },
    { label: 'Team Members', path: '/manager-dashboard', active: false },
  ];

  const assignmentColumns = [
    { key: 'title', label: 'Deliverable', width: '30%' },
    { key: 'course', label: 'Project', width: '15%' },
    { key: 'dueDate', label: 'Due Date', width: '15%' },
    { key: 'submissions', label: 'Submissions', width: '15%' },
    {
      key: 'status',
      label: 'Status',
      width: '15%',
      render: (status) => (
        <Badge variant={status === 'active' ? 'success' : 'info'}>
          {status}
        </Badge>
      ),
    },
  ];

  const studentColumns = [
    { key: 'name', label: 'Name', width: '25%' },
    { key: 'email', label: 'Email', width: '35%' },
    { key: 'submissions', label: 'Submissions', width: '20%' },
    { key: 'avgGrade', label: 'Avg Grade', width: '20%' },
  ];

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      navItems={navItems}
      userRole="Teacher"
      userName={user?.email || 'Teacher'}
      onLogout={handleLogout}
    >
      <Container>
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1>Welcome, {user?.email?.split('@')[0]}! 👋</h1>
          <p>Manage your projects and track team progress</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <Card>
            <CardBody className="stat-card">
              <div className="stat-value">3</div>
              <div className="stat-label">Active Projects</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="stat-card">
              <div className="stat-value">75/90</div>
              <div className="stat-label">Total Submissions</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="stat-card">
              <div className="stat-value">30</div>
              <div className="stat-label">Team Members</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="stat-card">
              <div className="stat-value">83%</div>
              <div className="stat-label">Completion Rate</div>
            </CardBody>
          </Card>
        </div>

        {/* Create Assignment Button */}
        <div className="action-bar">
          <Button
            variant="primary"
            onClick={() => setShowCreateAssignment(true)}
          >
            + Create New Assignment
          </Button>
        </div>

        {/* Assignments */}
        <div className="dashboard-section">
          <h2>📋 Projects</h2>
          <Table columns={assignmentColumns} data={assignments} />
        </div>

        {/* Students Overview */}
        <div className="dashboard-section">
          <h2>👥 Team Overview</h2>
          <Table columns={studentColumns} data={students} />
        </div>
      </Container>

      {/* Create Assignment Modal */}
      <Modal
        isOpen={showCreateAssignment}
        title="Create New Project"
        onClose={() => setShowCreateAssignment(false)}
        size="md"
      >
        <form className="assignment-form">
          <Input label="Assignment Title" placeholder="e.g., Web Development Project" fullWidth />
          <Select
            label="Course"
            options={[
              { value: 'ai101', label: 'AI 101' },
              { value: 'cs201', label: 'CS 201' },
              { value: 'web101', label: 'WEB 101' },
            ]}
            fullWidth
          />
          <Input label="Due Date" type="date" fullWidth />
          <Textarea label="Description" placeholder="Describe the assignment..." fullWidth />
          <div className="modal-actions">
            <Button variant="primary" fullWidth>
              Create Assignment
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setShowCreateAssignment(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
