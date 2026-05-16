import { useState, useEffect } from 'react';
import { Card, CardBody } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import './Assignments.css';

const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASE}/api/submissions/published`, {
        headers: {
          'X-User-Id': user.id,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }

      const data = await response.json();
      setAssignments(data);
    } catch (err) {
      setError(err.message || 'Failed to load assignments');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToSubmit = (assignmentId) => {
    window.location.href = `/student/deliverables/${assignmentId}`;
  };

  const getStatusColor = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    if (due < now) {
      return 'danger';
    }
    const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 3) {
      return 'warning';
    }
    return 'success';
  };

  const getStatusText = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    if (due < now) {
      return 'Overdue';
    }
    const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    if (daysLeft === 0) {
      return 'Due Today';
    }
    if (daysLeft === 1) {
      return 'Due Tomorrow';
    }
    return `${daysLeft} days left`;
  };

  if (loading) {
    return (
      <div className="assignments-container">
        <div className="loading-state">
          <p>Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="assignments-container">
      <div className="assignments-header">
        <h1>📝 Assignments</h1>
        <p className="subtitle">View and submit your assigned work</p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      {assignments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h2>No Assignments Yet</h2>
          <p>Check back later for new assignments from your teacher</p>
        </div>
      ) : (
        <div className="assignments-grid">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="assignment-card">
              <CardBody>
                <div className="assignment-header">
                  <h3>{assignment.title}</h3>
                  <Badge
                    text={getStatusText(assignment.dueDate)}
                    variant={getStatusColor(assignment.dueDate)}
                  />
                </div>

                <p className="assignment-description">{assignment.description}</p>

                <div className="assignment-details">
                  <div className="detail-item">
                    <span className="detail-label">Due Date:</span>
                    <span className="detail-value">
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{assignment.submissionType}</span>
                  </div>

                  {assignment.teamCode && (
                    <div className="detail-item">
                      <span className="detail-label">Team Code:</span>
                      <span className="detail-value">{assignment.teamCode}</span>
                    </div>
                  )}

                  <div className="detail-item">
                    <span className="detail-label">Max File Size:</span>
                    <span className="detail-value">{assignment.maxFileSizeMb} MB</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Allowed File Types:</span>
                    <span className="detail-value">{assignment.allowedFileTypes}</span>
                  </div>

                  {assignment.allowLateSubmission && (
                    <div className="detail-item late-allowed">
                      <span className="detail-label">✓ Late submissions allowed</span>
                    </div>
                  )}
                </div>

                <div className="assignment-actions">
                  <Button
                    variant="primary"
                    onClick={() => handleNavigateToSubmit(assignment.id)}
                    text="Submit Now"
                  />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Assignments;
