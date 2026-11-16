import { useEffect, useState } from 'react';
import DashboardLayout from '../Dashboard/DashboardLayout';
import { Card, CardBody } from '../../components/Card';
import { useAuth } from '../../context/AuthContext';
import './TeacherPages.css';

const Analytics = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetch('/api/submissions/my-submissions', { headers: { 'X-User-Id': user.id } })
      .then((response) => response.json())
      .then(setAssignments)
      .catch(() => setAssignments([]));
  }, [user.id]);

  const total = assignments.reduce((sum, item) => sum + Number(item.totalStudents || 0), 0);
  const submitted = assignments.reduce((sum, item) => sum + Number(item.submittedCount || 0), 0);
  const graded = assignments.reduce((sum, item) => sum + Number(item.gradedCount || 0), 0);
  const percentage = total ? Math.round((submitted / total) * 100) : 0;

  return (
    <DashboardLayout role="TEACHER">
      <div className="welcome-section">
        <h1>📈 Analytics</h1>
        <p>Track assignment completion and grading progress.</p>
      </div>
      <div className="stats-grid">
        <Card><CardBody className="stat-card"><div className="stat-value">{assignments.length}</div><div className="stat-label">Assignments</div></CardBody></Card>
        <Card><CardBody className="stat-card"><div className="stat-value">{submitted}/{total}</div><div className="stat-label">Submissions</div></CardBody></Card>
        <Card><CardBody className="stat-card"><div className="stat-value">{graded}</div><div className="stat-label">Graded</div></CardBody></Card>
        <Card><CardBody className="stat-card"><div className="stat-value">{percentage}%</div><div className="stat-label">Completion Rate</div></CardBody></Card>
      </div>
      <Card>
        <CardBody>
          <h2>Assignment performance</h2>
          <div className="teacher-table-wrapper">
            <table className="dashboard-table">
              <thead><tr><th>Assignment</th><th>Status</th><th>Submitted</th><th>Graded</th></tr></thead>
              <tbody>
                {assignments.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.isPublished ? 'Published' : 'Draft'}</td>
                    <td>{item.submittedCount || 0}/{item.totalStudents || 0}</td>
                    <td>{item.gradedCount || 0}/{item.totalStudents || 0}</td>
                  </tr>
                ))}
                {assignments.length === 0 && <tr><td colSpan="4">No assignment data available.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </DashboardLayout>
  );
};

export default Analytics;
