import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { Card, CardBody } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { Textarea } from '../../components/Input';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

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

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setAssignmentsLoading(true);
      const response = await fetch(`${API_BASE}/api/submissions/published`, {
        headers: {
          'X-User-Id': user.id,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Get only the first 3 assignments for the dashboard preview
        setAssignments(data.slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    } finally {
      setAssignmentsLoading(false);
    }
  };

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
    <DashboardLayout role="STUDENT">
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

        {/* Active Assignments */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>📝 Active Assignments</h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.location.href = '/student/assignments'}
              text="View All"
            />
          </div>
          {assignmentsLoading ? (
            <div className="loading-state">Loading assignments...</div>
          ) : assignments.length === 0 ? (
            <div className="empty-state-small">
              <p>No active assignments at the moment</p>
            </div>
          ) : (
            <div className="assignments-preview">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="assignment-preview-card">
                  <CardBody>
                    <div className="assignment-preview-header">
                      <h4>{assignment.title}</h4>
                      <Badge text={`Due ${new Date(assignment.dueDate).toLocaleDateString()}`} />
                    </div>
                    <p className="assignment-preview-desc">{assignment.description}</p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => window.location.href = `/student/deliverables/${assignment.id}`}
                      text="Submit Now"
                    />
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="dashboard-section">
          <h2>⏰ Upcoming Deadlines</h2>
          <div className="table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Days Left</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {upcomingDeadlines.map((deadline) => (
                  <tr key={deadline.id}>
                    <td>{deadline.title}</td>
                    <td>{deadline.daysLeft}</td>
                    <td>
                      <Badge
                        text={deadline.priority}
                        variant={deadline.priority === 'critical' ? 'danger' : deadline.priority === 'high' ? 'warning' : 'info'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="dashboard-section">
          <h2>📤 Your Submissions</h2>
          <div className="table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Deliverable</th>
                  <th>Project</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td className="title-cell">{submission.title}</td>
                    <td>{submission.course}</td>
                    <td>{submission.dueDate}</td>
                    <td>
                      <Badge
                        text={submission.status}
                        variant={submission.status === 'completed' ? 'success' : submission.status === 'submitted' ? 'info' : submission.status === 'in-progress' ? 'warning' : 'default'}
                      />
                    </td>
                    <td>{submission.grade ? <span className="grade-badge">{submission.grade}</span> : <span>—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

export default StudentDashboard;
