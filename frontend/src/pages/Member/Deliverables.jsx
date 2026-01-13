import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../Dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { 
  getDeliverablesByTeam,
  calculateDaysRemaining,
  getDeliverableStatus,
  formatDeadline
} from '../../services/deliverableService';
import { getActiveTeams } from '../../services/teamService';
import { getLatestSubmission } from '../../services/submissionService';
import './Deliverables.css';

const MemberDeliverablesPage = () => {
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
      setError('');
      
      // Get user's teams and fetch deliverables
      const teams = await getActiveTeams();
      
      if (teams.length === 0) {
        setDeliverables([]);
        return;
      }
      
      // Fetch deliverables for all user's teams
      const allDeliverables = await Promise.all(
        teams.map(team => getDeliverablesByTeam(team.id))
      );
      
      // Flatten deliverables
      const flatDeliverables = allDeliverables.flat();
      
      // Fetch submission status for each deliverable
      const deliverablesWithSubmissions = await Promise.all(
        flatDeliverables.map(async (deliv) => {
          try {
            const submission = await getLatestSubmission(deliv.id);
            if (submission) {
              return {
                ...deliv,
                hasSubmission: true,
                submissionStatus: submission.status,
                submittedAt: submission.createdAt,
                daysRemaining: calculateDaysRemaining(deliv.dueDate),
                status: getDeliverableStatus(deliv.progressPercentage, deliv.dueDate)
              };
            }
          } catch (err) {
            // Error fetching submission
            console.error(`Error fetching submission for deliverable ${deliv.id}:`, err);
          }
          // No submission found
          return {
            ...deliv,
            hasSubmission: false,
            daysRemaining: calculateDaysRemaining(deliv.dueDate),
            status: getDeliverableStatus(deliv.progressPercentage, deliv.dueDate)
          };
        })
      );
      
      // Sort by deadline
      const sortedDeliverables = deliverablesWithSubmissions
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      
      setDeliverables(sortedDeliverables);
    } catch (err) {
      setError('Failed to load deliverables: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (deliverable) => {
    navigate(`/member/deliverables/${deliverable.id}`, { state: { deliverable } });
  };

  const getStatusColor = (status) => {
    const colors = {
      'completed': '#28a745',
      'in-progress': '#007bff',
      'at-risk': '#ffc107',
      'overdue': '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'completed': 'Completed',
      'in-progress': 'In Progress',
      'at-risk': 'At Risk',
      'overdue': 'Overdue'
    };
    return labels[status] || status.charAt(0).toUpperCase() + status.slice(1);
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
                    <h3>{deliverable.name}</h3>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(deliverable.status) }}
                    >
                      {getStatusLabel(deliverable.status)}
                    </span>
                  </div>

                  {deliverable.hasSubmission && (
                    <div className="submission-indicator">
                      ✓ Submitted - {deliverable.submissionStatus}
                    </div>
                  )}

                  <p className="card-description">{deliverable.description}</p>

                  <div className="card-footer">
                    <div className="deadline-info">
                      <span className="deadline-label">Deadline:</span>
                      <span className="deadline-date">{formatDeadline(deliverable.dueDate)}</span>
                    </div>
                    <div className={`days-remaining ${deliverable.status}`}>
                      {deliverable.daysRemaining > 0
                        ? `${deliverable.daysRemaining} days left`
                        : `${Math.abs(deliverable.daysRemaining)} days overdue`}
                    </div>
                  </div>

                  <div className="card-action">
                    <button className="submit-btn">
                      {deliverable.hasSubmission ? '✓ View Submission' : (deliverable.status === 'overdue' ? '⚠️ Submit Now' : '📤 Submit')}
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

export default MemberDeliverablesPage;