import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../Dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import './Deliverables.css';

const MemberDeliverablesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchDeliverables();
  }, []);

  const fetchDeliverables = async () => {
    try {
      setLoading(true);
      // Mock data for assignments/deliverables
      const mockDeliverables = [
        {
          id: 1,
          title: 'Assignment 1: Project Proposal',
          description: 'Submit your project proposal with objectives and timeline',
          deadline: '2025-01-15',
          status: 'pending',
          daysRemaining: 28,
        },
        {
          id: 2,
          title: 'Assignment 2: Research Document',
          description: 'Complete research document with citations and analysis',
          deadline: '2025-01-22',
          status: 'pending',
          daysRemaining: 35,
        },
        {
          id: 3,
          title: 'Assignment 3: Mid-term Presentation',
          description: 'Prepare and submit presentation slides for review',
          deadline: '2025-02-05',
          status: 'pending',
          daysRemaining: 49,
        },
        {
          id: 4,
          title: 'Assignment 4: Code Implementation',
          description: 'Submit source code and documentation',
          deadline: '2024-12-25',
          status: 'overdue',
          daysRemaining: -24,
        },
        {
          id: 5,
          title: 'Assignment 5: Final Report',
          description: 'Comprehensive final report with conclusions',
          deadline: '2025-03-01',
          status: 'pending',
          daysRemaining: 73,
        },
        {
          id: 6,
          title: 'Assignment 6: Completed Task',
          description: 'This assignment has been completed',
          deadline: '2024-12-20',
          status: 'completed',
          daysRemaining: -22,
        },
      ];
      setDeliverables(mockDeliverables);
    } catch (err) {
      setError('Failed to load deliverables');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (deliverable, e) => {
    e.stopPropagation();
    setSelectedDeliverable(deliverable);
    setShowDetailsModal(true);
  };

  const handleEdit = () => {
    navigate(`/member/deliverables/${selectedDeliverable.id}`, { state: { deliverable: selectedDeliverable } });
    setShowDetailsModal(false);
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

  // Filter deliverables based on status (exclude completed by default)
  const filteredDeliverables = deliverables.filter(d => d.status !== 'completed').filter(d => 
    statusFilter === 'pending' || statusFilter === 'overdue' ? d.status === statusFilter : true
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredDeliverables.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDeliverables = filteredDeliverables.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
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
            <div className="filter-section" style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 600, marginRight: '12px' }}>Filter by Status:</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['pending', 'overdue'].map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusFilterChange(status)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '4px',
                      border: statusFilter === status ? '2px solid #0066cc' : '1px solid #e0e0e0',
                      backgroundColor: statusFilter === status ? '#e6f2ff' : '#ffffff',
                      color: statusFilter === status ? '#0066cc' : '#333',
                      cursor: 'pointer',
                      fontWeight: statusFilter === status ? 600 : 400,
                      fontSize: '0.9rem',
                    }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
              <button
                onClick={() => navigate('/member/history')}
                style={{
                  padding: '6px 12px',
                  marginLeft: '16px',
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0',
                  backgroundColor: '#f9f9f9',
                  color: '#333',
                  cursor: 'pointer',
                  fontWeight: 400,
                  fontSize: '0.9rem',
                }}
              >
                📜 View History
              </button>
            </div>

            <div className="deliverables-grid">
              {currentDeliverables.map((deliverable) => (
                <div
                  key={deliverable.id}
                  className="deliverable-card"
                  onClick={(e) => handleCardClick(deliverable, e)}
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

      {/* Details Modal */}
      {selectedDeliverable && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title="Deliverable Details"
        >
          <div style={{ padding: '10px 0' }}>
            <div style={{ marginBottom: '15px' }}>
              <strong>Title:</strong>
              <p style={{ margin: '5px 0 0 0', color: '#666' }}>{selectedDeliverable.title}</p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>Description:</strong>
              <p style={{ margin: '5px 0 0 0', color: '#666' }}>{selectedDeliverable.description}</p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>Deadline:</strong>
              <p style={{ margin: '5px 0 0 0', color: '#666' }}>{selectedDeliverable.deadline}</p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>Status:</strong>
              <p style={{ margin: '5px 0 0 0' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    color: 'white',
                    backgroundColor: getStatusColor(selectedDeliverable.status),
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  {getStatusLabel(selectedDeliverable.status)}
                </span>
              </p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>Time Remaining:</strong>
              <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                {selectedDeliverable.daysRemaining > 0
                  ? `${selectedDeliverable.daysRemaining} days left`
                  : `${Math.abs(selectedDeliverable.daysRemaining)} days overdue`}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <Button
                variant="secondary"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={handleEdit}
              >
                ✏️ Edit & Submit
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default MemberDeliverablesPage;