import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from './DashboardLayout';
import { Card, CardBody } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';
import Submissions from '../Teacher/Submissions';
import './Dashboard.css';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Overview state
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const headers = { 'X-User-Id': user.id };
    Promise.all([
      fetch('/api/submissions/my-submissions', { headers }).then((response) => response.json()),
      fetch('/api/users/class-members', { headers }).then((response) => response.json()),
    ])
      .then(([assignmentData, userData]) => {
        setAssignments(assignmentData);
        setStudents(userData.filter((item) => item.role === 'STUDENT'));
      })
      .catch(() => {
        setAssignments([]);
        setStudents([]);
      });
  }, [user.id]);

  const metrics = useMemo(() => {
    const total = assignments.reduce((sum, item) => sum + Number(item.totalStudents || 0), 0);
    const submitted = assignments.reduce((sum, item) => sum + Number(item.submittedCount || 0), 0);
    return {
      active: assignments.filter((item) => item.isPublished && new Date(item.dueDate) >= new Date()).length,
      submitted,
      total,
      completion: total ? `${Math.round((submitted / total) * 100)}%` : '0%',
    };
  }, [assignments]);

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
                <div className="stat-value">{metrics.active}</div>
                <div className="stat-label">Active Assignments</div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="stat-card">
                <div className="stat-value">{metrics.submitted}/{metrics.total}</div>
                <div className="stat-label">Total Submissions</div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="stat-card">
                <div className="stat-value">{students.length}</div>
                <div className="stat-label">Class Members</div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="stat-card">
                <div className="stat-value">{metrics.completion}</div>
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
                      <td>{assignment.teamCode || 'All Teams'}</td>
                      <td>{new Date(assignment.dueDate).toLocaleDateString()}</td>
                      <td className="submissions-cell">{assignment.submittedCount || 0}/{assignment.totalStudents || 0}</td>
                      <td>
                        <Badge
                          text={assignment.isPublished ? 'Published' : 'Draft'}
                          variant={assignment.isPublished ? 'success' : 'default'}
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
                      <td>—</td>
                      <td>Not graded</td>
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
