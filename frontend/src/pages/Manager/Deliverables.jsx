import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../Dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Input, Textarea, Select } from '../../components/Input';
import '../Member/Deliverables.css';

const ManagerDeliverablesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deliverables, setDeliverables] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const itemsPerPage = 6;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    teamId: '',
    fileTypes: 'PDF, DOCX, PPTX',
  });

  useEffect(() => {
    fetchDeliverables();
    fetchTeams();
  }, []);

  const fetchDeliverables = async () => {
    try {
      setLoading(true);
      const mockDeliverables = [
        {
          id: 1,
          title: 'Project Proposal',
          description: 'Submit project proposal with objectives and timeline',
          deadline: '2025-01-15',
          team: 'Team A',
          submissions: 5,
          totalTeamSize: 5,
          status: 'completed',
        },
        {
          id: 2,
          title: 'Research Document',
          description: 'Complete research document with citations and analysis',
          deadline: '2025-01-22',
          team: 'Team B',
          submissions: 3,
          totalTeamSize: 5,
          status: 'pending',
        },
        {
          id: 3,
          title: 'Design Mockups',
          description: 'UI/UX design mockups for review',
          deadline: '2025-01-25',
          team: 'Team A',
          submissions: 4,
          totalTeamSize: 5,
          status: 'pending',
        },
        {
          id: 4,
          title: 'Mid-term Presentation',
          description: 'Presentation slides for review',
          deadline: '2025-02-05',
          team: 'Team C',
          submissions: 0,
          totalTeamSize: 5,
          status: 'pending',
        },
        {
          id: 5,
          title: 'Code Implementation',
          description: 'Submit source code and documentation',
          deadline: '2024-12-25',
          team: 'Team B',
          submissions: 2,
          totalTeamSize: 5,
          status: 'overdue',
        },
      ];
      setDeliverables(mockDeliverables);
      setError('');
    } catch (err) {
      setError('Failed to load deliverables');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const mockTeams = [
        { id: 1, name: 'Team A' },
        { id: 2, name: 'Team B' },
        { id: 3, name: 'Team C' },
        { id: 4, name: 'Team D' },
      ];
      setTeams(mockTeams);
    } catch (err) {
      console.error('Failed to load teams:', err);
    }
  };

  const handleCreateDeliverable = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && selectedDeliverable) {
        setDeliverables(deliverables.map(d => d.id === selectedDeliverable.id 
          ? { ...d, ...formData } 
          : d
        ));
        setIsEditing(false);
      } else {
        const newDeliverable = {
          id: deliverables.length + 1,
          ...formData,
          submissions: 0,
          totalTeamSize: 5,
          status: 'pending',
        };
        setDeliverables([...deliverables, newDeliverable]);
      }
      setShowCreateModal(false);
      setShowDetailsModal(false);
      setFormData({
        title: '',
        description: '',
        deadline: '',
        teamId: '',
        fileTypes: 'PDF, DOCX, PPTX',
      });
    } catch (err) {
      setError('Failed to save deliverable');
    }
  };

  const handleCardClick = (deliverable) => {
    setSelectedDeliverable(deliverable);
    setShowDetailsModal(true);
  };

  const handleEdit = () => {
    setFormData({
      title: selectedDeliverable.title,
      description: selectedDeliverable.description,
      deadline: selectedDeliverable.deadline,
      teamId: selectedDeliverable.team,
      fileTypes: 'PDF, DOCX, PPTX',
    });
    setIsEditing(true);
    setShowCreateModal(true);
    setShowDetailsModal(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this deliverable?')) {
      setDeliverables(deliverables.filter(d => d.id !== selectedDeliverable.id));
      setShowDetailsModal(false);
    }
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

  const calculateDaysRemaining = (deadline) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const daysRemaining = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    return daysRemaining;
  };

  // Filter deliverables based on status
  const filteredDeliverables = statusFilter === 'all' 
    ? deliverables 
    : deliverables.filter(d => d.status === statusFilter);

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
      <DashboardLayout role="MANAGER">
        <div className="member-deliverables-page">
          <div className="loading">Loading deliverables...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="MANAGER">
      <div className="member-deliverables-page">
        <div className="page-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>📋 Deliverables</h1>
              <p>Manage and track team deliverables</p>
            </div>
            <Button variant="primary" onClick={() => {
              setIsEditing(false);
              setFormData({
                title: '',
                description: '',
                deadline: '',
                teamId: '',
                fileTypes: 'PDF, DOCX, PPTX',
              });
              setShowCreateModal(true);
            }}>
              + Create Deliverable
            </Button>
          </div>
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
            <p>Create a new deliverable to get started.</p>
          </div>
        ) : (
          <>
            <div className="filter-section" style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 600, marginRight: '12px' }}>Filter by Status:</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['all', 'pending', 'completed', 'overdue'].map(status => (
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
            </div>

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
                      <span className="deadline-label">Team:</span>
                      <span className="deadline-date">{deliverable.team}</span>
                    </div>
                    <div className="deadline-info">
                      <span className="deadline-label">Deadline:</span>
                      <span className="deadline-date">{deliverable.deadline}</span>
                    </div>
                    <div className="deadline-info">
                      <span className="deadline-label">Submissions:</span>
                      <span className="deadline-date">{deliverable.submissions}/{deliverable.totalTeamSize}</span>
                    </div>
                  </div>

                  <div className="card-action">
                    <button className="submit-btn">📊 View Details</button>
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
              <strong>Team:</strong>
              <p style={{ margin: '5px 0 0 0', color: '#666' }}>{selectedDeliverable.team}</p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>Deadline:</strong>
              <p style={{ margin: '5px 0 0 0', color: '#666' }}>{selectedDeliverable.deadline}</p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>Submissions:</strong>
              <p style={{ margin: '5px 0 0 0', color: '#666' }}>{selectedDeliverable.submissions}/{selectedDeliverable.totalTeamSize}</p>
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

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <Button
                variant="secondary"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </Button>
              <Button
                variant="warning"
                onClick={handleEdit}
              >
                ✏️ Edit
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
              >
                🗑️ Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create/Edit Deliverable Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setIsEditing(false);
        }}
        title={isEditing ? 'Edit Deliverable' : 'Create New Deliverable'}
      >
        <form onSubmit={handleCreateDeliverable}>
          <div style={{ marginBottom: '15px' }}>
            <label>Deliverable Title *</label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Enter deliverable title"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter deliverable description"
              rows="3"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Assign to Team *</label>
            <Select
              value={formData.teamId}
              onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
              required
            >
              <option value="">Select a team</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </Select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Deadline *</label>
            <Input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Allowed File Types</label>
            <Input
              type="text"
              value={formData.fileTypes}
              onChange={(e) => setFormData({ ...formData, fileTypes: e.target.value })}
              placeholder="e.g., PDF, DOCX, PPTX"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default ManagerDeliverablesPage;
