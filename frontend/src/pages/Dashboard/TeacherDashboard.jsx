import { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import { Card, CardBody } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';
import Submissions from '../Teacher/Submissions';
import './Dashboard.css';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Overview state
  const [assignments] = useState([
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
    <DashboardLayout role="TEACHER">
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'submissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('submissions')}
        >
          📋 Assignments & Submissions
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="welcome-section">
            <h1>Welcome, {user?.name?.split(' ')[0]}! 👋</h1>
            <p>Manage your assignments and track student progress</p>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <Card>
              <CardBody className="stat-card">
                <div className="stat-value">3</div>
                <div className="stat-label">Active Assignments</div>
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
                <div className="stat-label">Class Members</div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="stat-card">
                <div className="stat-value">83%</div>
                <div className="stat-label">Completion Rate</div>
              </CardBody>
            </Card>
          </div>

          {/* Assignments */}
          <div className="dashboard-section">
            <h2>📋 Recent Assignments</h2>
            <div className="table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Course</th>
                    <th>Due Date</th>
                    <th>Submissions</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td className="title-cell">{assignment.title}</td>
                      <td>{assignment.course}</td>
                      <td>{assignment.dueDate}</td>
                      <td className="submissions-cell">{assignment.submissions}</td>
                      <td>
                        <Badge
                          text={assignment.status}
                          variant={assignment.status === 'active' ? 'success' : 'default'}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Students Overview */}
          <div className="dashboard-section">
            <h2>👥 Class Members</h2>
            <div className="table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Submissions</th>
                    <th>Avg Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.submissions}</td>
                      <td>{student.avgGrade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'submissions' && <Submissions />}
    </DashboardLayout>
  );
};

export default TeacherDashboard;
