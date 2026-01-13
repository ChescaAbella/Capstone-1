import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../Dashboard/DashboardLayout';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { Alert } from '../../components/Alert';
import { 
  createDeliverable, 
  getDeliverablesByTeam,
  updateDeliverableProgress,
  deleteDeliverable,
  getOverdueDeliverables,
  getUpcomingDeliverables
} from '../../services/deliverableService';
import { getAllProjects } from '../../services/projectService';
import { getActiveTeams } from '../../services/teamService';
import './ManagerDeliverables.css';

export const ManagerDeliverablesPage = () => {
  const navigate = useNavigate();
  const [deliverables, setDeliverables] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    projectId: '',
    teamId: '',
    assignedTo: ''
  });
  
  const [progressData, setProgressData] = useState({
    progress: 0,
    notes: ''
  });
  
  // Filter states
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // all, overdue, upcoming

  useEffect(() => {
    loadData();
  }, [selectedTeam, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load teams and projects
      const [teamsData, projectsData] = await Promise.all([
        getActiveTeams(),
        getAllProjects()
      ]);
      
      setTeams(teamsData);
      setProjects(projectsData);
      
      // Load deliverables based on filters
      let delivData = [];
      if (statusFilter === 'overdue') {
        delivData = await getOverdueDeliverables();
      } else if (statusFilter === 'upcoming') {
        delivData = await getUpcomingDeliverables(7);
      } else if (selectedTeam && selectedTeam !== 'all') {
        delivData = await getDeliverablesByTeam(parseInt(selectedTeam));
      } else {
        // Load all deliverables for all teams
        const allDelivs = await Promise.all(
          teamsData.map(team => getDeliverablesByTeam(team.id))
        );
        delivData = allDelivs.flat();
      }
      
      setDeliverables(delivData);
    } catch (err) {
      setError('Failed to load deliverables: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeliverable = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await createDeliverable(formData);
      setSuccess('Deliverable created successfully!');
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        deadline: '',
        projectId: '',
        teamId: '',
        assignedTo: ''
      });
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to create deliverable: ' + err.message);
    }
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    if (!selectedDeliverable) return;
    
    try {
      setError('');
      await updateDeliverableProgress(selectedDeliverable.id, progressData);
      setSuccess('Progress updated successfully!');
      setShowProgressModal(false);
      setSelectedDeliverable(null);
      setProgressData({ progress: 0, notes: '' });
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update progress: ' + err.message);
    }
  };

  const handleDeleteDeliverable = async (id) => {
    if (!confirm('Are you sure you want to delete this deliverable?')) return;
    
    try {
      setError('');
      await deleteDeliverable(id);
      setSuccess('Deliverable deleted successfully!');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete deliverable: ' + err.message);
    }
  };

  const openProgressModal = (deliverable) => {
    setSelectedDeliverable(deliverable);
    setProgressData({
      progress: deliverable.progress || 0,
      notes: ''
    });
    setShowProgressModal(true);
  };

  const getStatusBadge = (deliverable) => {
    const { progress, deadline } = deliverable;
    const daysRemaining = calculateDaysRemaining(deadline);
    
    if (progress === 100) return { label: 'Completed', color: '#28a745' };
    if (daysRemaining < 0) return { label: 'Overdue', color: '#dc3545' };
    if (progress < 30 && daysRemaining <= 7) return { label: 'At Risk', color: '#ffc107' };
    return { label: 'In Progress', color: '#007bff' };
  };

  const calculateDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="manager-deliverables-page">
          <div className="loading">Loading deliverables...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="manager-deliverables-page">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>📦 Manage Deliverables</h1>
            <p>Create, track, and manage team deliverables</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            + Create Deliverable
          </Button>
        </div>

        {/* Alerts */}
        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Filter by Team:</label>
            <select 
              value={selectedTeam} 
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Teams</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Filter by Status:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All</option>
              <option value="upcoming">Upcoming (7 days)</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Deliverables Grid */}
        {deliverables.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No Deliverables Found</h3>
            <p>Create your first deliverable to get started</p>
            <Button onClick={() => setShowCreateModal(true)}>
              + Create Deliverable
            </Button>
          </div>
        ) : (
          <div className="deliverables-grid">
            {deliverables.map((deliverable) => {
              const status = getStatusBadge(deliverable);
              const daysRemaining = calculateDaysRemaining(deliverable.deadline);
              
              return (
                <Card key={deliverable.id} className="deliverable-card">
                  <div className="card-header">
                    <h3>{deliverable.title}</h3>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: status.color }}
                    >
                      {status.label}
                    </span>
                  </div>

                  <p className="card-description">{deliverable.description}</p>

                  <div className="card-details">
                    <div className="detail-row">
                      <span className="label">Project:</span>
                      <span>{deliverable.projectName || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Team:</span>
                      <span>{deliverable.teamName || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Deadline:</span>
                      <span>{formatDate(deliverable.deadline)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Days Left:</span>
                      <span className={daysRemaining < 0 ? 'text-danger' : ''}>
                        {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days`}
                      </span>
                    </div>
                  </div>

                  <div className="progress-section">
                    <div className="progress-header">
                      <span>Progress</span>
                      <span className="progress-percent">{deliverable.progress || 0}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${deliverable.progress || 0}%`,
                          backgroundColor: status.color
                        }}
                      />
                    </div>
                  </div>

                  <div className="card-actions">
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => navigate(`/manager/submissions/${deliverable.id}`)}
                    >
                      📋 View Submissions
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => openProgressModal(deliverable)}
                    >
                      Update Progress
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDeleteDeliverable(deliverable.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create Deliverable Modal */}
        {showCreateModal && (
          <Modal 
            title="Create New Deliverable" 
            onClose={() => setShowCreateModal(false)}
          >
            <form onSubmit={handleCreateDeliverable} className="deliverable-form">
              <Input
                label="Title *"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="textarea"
                />
              </div>

              <Input
                label="Deadline *"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required
              />

              <div className="form-group">
                <label>Project *</label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  required
                  className="select"
                >
                  <option value="">Select project...</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Team *</label>
                <select
                  value={formData.teamId}
                  onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                  required
                  className="select"
                >
                  <option value="">Select team...</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Assigned To (User ID)"
                type="number"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                placeholder="Optional"
              />

              <div className="modal-actions">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Deliverable</Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Update Progress Modal */}
        {showProgressModal && selectedDeliverable && (
          <Modal 
            title={`Update Progress: ${selectedDeliverable.title}`}
            onClose={() => setShowProgressModal(false)}
          >
            <form onSubmit={handleUpdateProgress} className="progress-form">
              <div className="form-group">
                <label>Progress: {progressData.progress}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressData.progress}
                  onChange={(e) => setProgressData({ ...progressData, progress: parseInt(e.target.value) })}
                  className="progress-slider"
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={progressData.notes}
                  onChange={(e) => setProgressData({ ...progressData, notes: e.target.value })}
                  rows={4}
                  className="textarea"
                  placeholder="Add notes about this progress update..."
                />
              </div>

              <div className="modal-actions">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setShowProgressModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Progress</Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManagerDeliverablesPage;
