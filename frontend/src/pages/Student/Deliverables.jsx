import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../Dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import './Deliverables.css';

const StudentDeliverablesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchDeliverables();
  }, []);

  const fetchDeliverables = async () => {
    try {
      setLoading(true);
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      
      const response = await fetch(`${apiBase}/api/submissions/available`, {
        headers: {
          'X-User-Id': user?.id,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch submissions');
      
      let submissions = await response.json();
      
      // Calculate days remaining and status
      submissions = submissions.map(s => {
        const now = new Date();
        const dueDate = new Date(s.dueDate);
        const daysRemaining = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        
        let status = 'pending';
        if (daysRemaining < 0) {
          status = 'overdue';
        } else if (daysRemaining === 0) {
          status = 'due-today';
        }

        return {
          ...s,
          status,
          daysRemaining,
          deadline: dueDate.toISOString().split('T')[0],
        };
      });

      // Sort by due date
      submissions.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

      setDeliverables(submissions);
    } catch (err) {
      setError('Failed to load deliverables');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (deliverable) => {
    navigate(`/student/deliverables/${deliverable.id}`, { state: { deliverable } });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'overdue':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Pagination logic
  const totalPages = Math.ceil(deliverables.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDeliverables = deliverables.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="member-deliverables-page">
          <div className="loading">Loading deliverables...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="member-deliverables-page">
        <div className="page-header">
          <h1>📋 Deliverables</h1>
          <p>View and submit your assignments</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {deliverables.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No Deliverables</h3>
            <p>You don't have any assignments yet.</p>
          </div>
        ) : (
          <>
            <div className="deliverables-grid">
              {currentDeliverables.map((deliverable) => (
                <div
                  key={deliverable.id}
                  className="deliverable-card"
                  onClick={() => handleCardClick(deliverable)}
                >
                  <div className="card-header">
                    <h3>{deliverable.title}</h3>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(deliverable.status) }}
                    >
                      {getStatusLabel(deliverable.status)}
                    </span>
                  </div>

                  <p className="card-description">{deliverable.description}</p>

                  <div className="card-footer">
                    <div className="deadline-info">
                      <span className="deadline-label">Deadline:</span>
                      <span className="deadline-date">{deliverable.deadline}</span>
                    </div>
                    <div className={`days-remaining ${deliverable.status}`}>
                      {deliverable.daysRemaining > 0
                        ? `${deliverable.daysRemaining} days left`
                        : `${Math.abs(deliverable.daysRemaining)} days overdue`}
                    </div>
                  </div>

                  <div className="card-action">
                    <button className="submit-btn">
                      {deliverable.status === 'overdue' ? '⚠️ Submit Now' : '📤 Submit'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>

                <div className="pagination-info">
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDeliverablesPage;