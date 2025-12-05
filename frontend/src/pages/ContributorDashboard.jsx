import { useState } from 'react';
import { DashboardLayout, Container } from '../components/Layout';
import { Card, CardBody, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { Input, Textarea } from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export const ContributorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState('');

  // Sample data
  const submissions = [
    {
      id: 1,
      title: 'Introduction to AI',
      course: 'AI 101',
      dueDate: '2025-01-15',
      status: 'completed',
      grade: 'A+',
      submittedDate: '2025-01-10'
    },
    {
      id: 2,
      title: 'Data Structures Project',
      course: 'CS 201',
      dueDate: '2025-01-20',
      status: 'in-progress',
      grade: null,
      submittedDate: null
    },
    {
      id: 3,
      title: 'Web Development Assignment',
      course: 'WEB 101',
      dueDate: '2025-01-25',
      status: 'submitted',
      grade: null,
      submittedDate: '2025-01-22'
    },
    {
      id: 4,
      title: 'Database Design',
      course: 'DB 301',
      dueDate: '2025-02-05',
      status: 'pending',
      grade: null,
      submittedDate: null
    },
  ];

  const upcomingDeadlines = [
    {
      id: 1,
      title: 'Database Design',
      daysLeft: 12,
      dueDate: '2025-02-05',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Mobile App Final',
      daysLeft: 5,
      dueDate: '2025-01-31',
      priority: 'critical'
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarItems = [
    { icon: '📊', label: 'Dashboard', path: '/contributor-dashboard', active: true },
    { icon: '📤', label: 'Submissions', path: '/contributor-dashboard', active: false },
    { icon: '📋', label: 'Deliverables', path: '/contributor-dashboard', active: false },
    { icon: '⏰', label: 'Deadlines', path: '/contributor-dashboard', active: false },
    { icon: '📈', label: 'Progress', path: '/contributor-dashboard', active: false },
  ];

  const navItems = [
    { label: 'Dashboard', path: '/contributor-dashboard', active: true },
    { label: 'Submissions', path: '/contributor-dashboard', active: false },
    { label: 'Deliverables', path: '/contributor-dashboard', active: false },
  ];

  const submissionColumns = [
    { key: 'title', label: 'Deliverable', width: '30%' },
    { key: 'course', label: 'Project', width: '15%' },
    { key: 'dueDate', label: 'Due Date', width: '15%' },
    {
      key: 'status',
      label: 'Status',
      width: '15%',
      render: (status) => (
        <Badge variant={status === 'completed' ? 'success' : status === 'submitted' ? 'info' : status === 'in-progress' ? 'warning' : 'default'}>
          {status}
        </Badge>
      ),
    },
    {
      key: 'grade',
      label: 'Feedback',
      width: '15%',
      render: (grade) => grade ? <span className="grade-badge">{grade}</span> : <span>—</span>,
    },
  ];

  const deadlineColumns = [
    { key: 'title', label: 'Assignment', width: '50%' },
    { key: 'daysLeft', label: 'Days Left', width: '20%' },
    {
      key: 'priority',
      label: 'Priority',
      width: '30%',
      render: (priority) => (
        <Badge variant={priority === 'critical' ? 'danger' : priority === 'high' ? 'warning' : 'info'}>
          {priority}
        </Badge>
      ),
    },
  ];

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      navItems={navItems}
      userRole="Student"
      userName={user?.email || 'Student'}
      onLogout={handleLogout}
    >
      <Container>
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1>Welcome, {user?.email?.split('@')[0]}! 👋</h1>
          <p>Here's your submission overview and upcoming deadlines</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <Card>
            <CardBody className="stat-card">
              <div className="stat-value">3/4</div>
              <div className="stat-label">Completed</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="stat-card">
              <div className="stat-value">1</div>
              <div className="stat-label">In Progress</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="stat-card">
              <div className="stat-value">2</div>
              <div className="stat-label">Days Until Deadline</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="stat-card">
              <div className="stat-value">95%</div>
              <div className="stat-label">Completion Rate</div>
            </CardBody>
          </Card>
        </div>

        {/* AI Assistant Card */}
        <Card className="ai-assistant-card">
          <CardBody>
            <div className="ai-header">
              <h3>🤖 AI Deadline Assistant</h3>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAssistant(true)}
              >
                Chat with AI
              </Button>
            </div>
            <p>Get AI-powered insights about your deadlines and submission status</p>
          </CardBody>
        </Card>

        {/* Upcoming Deadlines */}
        <div className="dashboard-section">
          <h2>⏰ Upcoming Deadlines</h2>
          <Table columns={deadlineColumns} data={upcomingDeadlines} />
        </div>

        {/* Recent Submissions */}
        <div className="dashboard-section">
          <h2>📤 Your Submissions</h2>
          <Table columns={submissionColumns} data={submissions} />
        </div>
      </Container>

      {/* AI Assistant Modal */}
      <Modal
        isOpen={showAssistant}
        title="AI Deadline Assistant"
        onClose={() => {
          setShowAssistant(false);
          setAssistantMessage('');
        }}
        size="md"
      >
        <div className="ai-chat">
          <div className="chat-messages">
            <div className="message ai-message">
              <p>Hi! I'm your AI assistant. I can help you:</p>
              <ul>
                <li>Predict upcoming deadlines</li>
                <li>Suggest optimal submission times</li>
                <li>Analyze your submission patterns</li>
                <li>Recommend study strategies</li>
              </ul>
            </div>
            {assistantMessage && (
              <div className="message user-message">
                <p>{assistantMessage}</p>
              </div>
            )}
          </div>
          <div className="chat-input">
            <Input
              placeholder="Ask the AI assistant..."
              value={assistantMessage}
              onChange={(e) => setAssistantMessage(e.target.value)}
              fullWidth
            />
            <Button variant="primary" onClick={() => setAssistantMessage('')}>
              Send
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};
