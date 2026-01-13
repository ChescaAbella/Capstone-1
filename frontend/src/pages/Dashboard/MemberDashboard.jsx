import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { Card, CardBody } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Table } from '../../components/Table';
import { Modal } from '../../components/Modal';
import { Input, Textarea } from '../../components/Input';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const MemberDashboard = () => {
  const { user } = useAuth();
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

  const submissionColumns = [
    { key: 'title', label: 'Deliverable', width: '30%' },
    { key: 'course', label: 'Project', width: '15%' },
    { key: 'dueDate', label: 'Due Date', width: '15%' },
    {
      key: 'status',
      label: 'Status',
      width: '15%',
      render: (row) => (
        <Badge variant={row.status === 'completed' ? 'success' : row.status === 'submitted' ? 'info' : row.status === 'in-progress' ? 'warning' : 'default'}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'grade',
      label: 'Feedback',
      width: '15%',
      render: (row) => row.grade ? <span className="grade-badge">{row.grade}</span> : <span>—</span>,
    },
  ];

  const deadlineColumns = [
    { key: 'title', label: 'Assignment', width: '50%' },
    { key: 'daysLeft', label: 'Days Left', width: '20%' },
    {
      key: 'priority',
      label: 'Priority',
      width: '30%',
      render: (row) => (
        <Badge variant={row.priority === 'critical' ? 'danger' : row.priority === 'high' ? 'warning' : 'info'}>
          {row.priority}
        </Badge>
      ),
    },
  ];

  return (
    <DashboardLayout role="MEMBER">
      <div className="welcome-section">
        <h1>Welcome, {user?.name?.split(' ')[0]}! 👋</h1>
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
              <h3>📦 My Deliverables</h3>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/member/deliverables')}
              >
                View All Deliverables
              </Button>
            </div>
            <p>View, track, and submit your assigned deliverables</p>
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

        {/* AI Assistant Modal */}
        <Modal
          isOpen={showAssistant}
          title="AI Deadline Assistant"
          onClose={() => setShowAssistant(false)}
          size="lg"
        >
          <div className="assistant-chat">
            <div className="chat-messages">
              <div className="message ai-message">
                <p>Hello! I'm your AI assistant. I can help you with deadline management, submission tips, and academic insights. How can I help you today?</p>
              </div>
            </div>
            <div className="chat-input-area">
              <Textarea
                value={assistantMessage}
                onChange={(e) => setAssistantMessage(e.target.value)}
                placeholder="Ask me anything about your deadlines..."
                fullWidth
              />
              <Button variant="primary" fullWidth>
                Send Message
              </Button>
            </div>
          </div>
        </Modal>
    </DashboardLayout>
  );
};

export default MemberDashboard;
