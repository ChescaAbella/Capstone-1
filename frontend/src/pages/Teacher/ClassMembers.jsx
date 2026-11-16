import { useEffect, useState } from 'react';
import DashboardLayout from '../Dashboard/DashboardLayout';
import { Card, CardBody } from '../../components/Card';
import { Alert } from '../../components/Alert';
import { useAuth } from '../../context/AuthContext';
import './TeacherPages.css';

const ClassMembers = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/users/class-members', { headers: { 'X-User-Id': user.id } })
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load class members');
        return response.json();
      })
      .then(setMembers)
      .catch((err) => setError(err.message));
  }, [user.id]);

  return (
    <DashboardLayout role="TEACHER">
      <div className="welcome-section">
        <h1>👥 Class Members</h1>
        <p>Monitor student participation and submission progress.</p>
      </div>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      <Card>
        <CardBody>
          <div className="teacher-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Team</th><th>Status</th></tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td>{member.name}</td>
                    <td>{member.email}</td>
                    <td>{member.teamCode || 'Unassigned'}</td>
                    <td>{member.active === false ? 'Inactive' : 'Active'}</td>
                  </tr>
                ))}
                {members.length === 0 && (
                  <tr><td colSpan="4">No class members found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </DashboardLayout>
  );
};

export default ClassMembers;
