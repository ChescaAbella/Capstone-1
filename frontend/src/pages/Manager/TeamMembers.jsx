import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../Dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Input, Select } from '../../components/Input';
import '../Member/Deliverables.css';

const ManagerTeamMembersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const itemsPerPage = 6;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'member',
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      setCurrentPage(1);
      fetchTeamMembers(selectedTeam);
    }
  }, [selectedTeam]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const mockTeams = [
        { id: 1, name: 'Team A', memberCount: 5 },
        { id: 2, name: 'Team B', memberCount: 4 },
        { id: 3, name: 'Team C', memberCount: 5 },
        { id: 4, name: 'Team D', memberCount: 3 },
      ];
      setTeams(mockTeams);
      if (mockTeams.length > 0) {
        setSelectedTeam(mockTeams[0].name);
      }
      setError('');
    } catch (err) {
      setError('Failed to load teams');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async (teamName) => {
    try {
      setLoading(true);
      const mockMembers = {
        'Team A': [
          {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            role: 'Lead',
            status: 'active',
            joinDate: '2025-01-01',
            submissions: 15,
          },
          {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'Member',
            status: 'active',
            joinDate: '2025-01-05',
            submissions: 12,
          },
          {
            id: 3,
            name: 'Bob Johnson',
            email: 'bob@example.com',
            role: 'Member',
            status: 'active',
            joinDate: '2025-01-08',
            submissions: 10,
          },
          {
            id: 4,
            name: 'Alice Chen',
            email: 'alice@example.com',
            role: 'Member',
            status: 'inactive',
            joinDate: '2025-01-02',
            submissions: 5,
          },
          {
            id: 5,
            name: 'Charlie Brown',
            email: 'charlie@example.com',
            role: 'Member',
            status: 'active',
            joinDate: '2025-01-10',
            submissions: 8,
          },
        ],
        'Team B': [
          {
            id: 6,
            name: 'Diana Prince',
            email: 'diana@example.com',
            role: 'Lead',
            status: 'active',
            joinDate: '2025-01-01',
            submissions: 14,
          },
          {
            id: 7,
            name: 'Eve Martinez',
            email: 'eve@example.com',
            role: 'Member',
            status: 'active',
            joinDate: '2025-01-05',
            submissions: 11,
          },
          {
            id: 8,
            name: 'Frank Wilson',
            email: 'frank@example.com',
            role: 'Member',
            status: 'active',
            joinDate: '2025-01-07',
            submissions: 9,
          },
          {
            id: 9,
            name: 'Grace Lee',
            email: 'grace@example.com',
            role: 'Member',
            status: 'inactive',
            joinDate: '2025-01-03',
            submissions: 6,
          },
        ],
        'Team C': [
          {
            id: 10,
            name: 'Henry Jackson',
            email: 'henry@example.com',
            role: 'Lead',
            status: 'active',
            joinDate: '2025-01-01',
            submissions: 16,
          },
          {
            id: 11,
            name: 'Ivy Taylor',
            email: 'ivy@example.com',
            role: 'Member',
            status: 'active',
            joinDate: '2025-01-06',
            submissions: 13,
          },
          {
            id: 12,
            name: 'Jack Anderson',
            email: 'jack@example.com',
            role: 'Member',
            status: 'active',
            joinDate: '2025-01-09',
            submissions: 10,
          },
          {
            id: 13,
            name: 'Kate White',
            email: 'kate@example.com',
            role: 'Member',
            status: 'active',
            joinDate: '2025-01-04',
            submissions: 12,
          },
          {
            id: 14,
            name: 'Leo Harris',
            email: 'leo@example.com',
            role: 'Member',
            status: 'inactive',
            joinDate: '2025-01-11',
            submissions: 1,
          },
        ],
        'Team D': [
          {
            id: 15,
            name: 'Megan Clark',
            email: 'megan@example.com',
            role: 'Lead',
            status: 'active',
            joinDate: '2025-01-01',
            submissions: 12,
          },
          {
            id: 16,
            name: 'Nathan Davis',
            email: 'nathan@example.com',
            role: 'Member',
            status: 'active',
            joinDate: '2025-01-07',
            submissions: 9,
          },
          {
            id: 17,
            name: 'Olivia Garcia',
            email: 'olivia@example.com',
            role: 'Member',
            status: 'active',
            joinDate: '2025-01-08',
            submissions: 8,
          },
        ],
      };

      setTeamMembers(mockMembers[teamName] || []);
      setError('');
    } catch (err) {
      setError('Failed to load team members');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const newMember = {
        id: teamMembers.length + 1,
        ...formData,
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
        submissions: 0,
      };
      setTeamMembers([...teamMembers, newMember]);
      setShowAddMemberModal(false);
      setFormData({
        name: '',
        email: '',
        role: 'member',
      });
    } catch (err) {
      setError('Failed to add member');
    }
  };

  const handleRemoveMember = (memberId, e) => {
    e.stopPropagation();
    setTeamMembers(teamMembers.filter(m => m.id !== memberId));
  };

  const getStatusColor = (status) => {
    return status === 'active' ? '#28a745' : '#ffc107';
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const totalPages = Math.ceil(teamMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMembers = teamMembers.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  if (loading && teams.length === 0) {
    return (
      <DashboardLayout role="MANAGER">
        <div className="member-deliverables-page">
          <div className="loading">Loading teams...</div>
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
              <h1>👥 Team Members</h1>
              <p>Manage team members and assignments</p>
            </div>
            <Button variant="primary" onClick={() => setShowAddMemberModal(true)}>
              + Add Member
            </Button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
            Select Team:
          </label>
          <Select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            style={{ maxWidth: '300px' }}
          >
            {teams.map(team => (
              <option key={team.id} value={team.name}>
                {team.name} ({team.memberCount} members)
              </option>
            ))}
          </Select>
        </div>

        {teamMembers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No Members</h3>
            <p>Add members to this team to get started.</p>
          </div>
        ) : (
          <>
            <div className="deliverables-grid">
              {currentMembers.map((member) => (
                <div
                  key={member.id}
                  className="deliverable-card"
                  style={{ cursor: 'default' }}
                >
                  <div className="card-header">
                    <h3>{member.name}</h3>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(member.status) }}
                    >
                      {getStatusLabel(member.status)}
                    </span>
                  </div>

                  <p className="card-description">{member.email}</p>

                  <div className="card-footer">
                    <div className="deadline-info">
                      <span className="deadline-label">Role:</span>
                      <span className="deadline-date">{member.role}</span>
                    </div>
                    <div className="deadline-info">
                      <span className="deadline-label">Joined:</span>
                      <span className="deadline-date">{member.joinDate}</span>
                    </div>
                    <div className="deadline-info">
                      <span className="deadline-label">Submissions:</span>
                      <span className="deadline-date">{member.submissions}</span>
                    </div>
                  </div>

                  <div className="card-action">
                    <button
                      className="submit-btn"
                      style={{ backgroundColor: '#dc3545' }}
                      onClick={(e) => handleRemoveMember(member.id, e)}
                    >
                      🗑️ Remove
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

      {/* Add Member Modal */}
      <Modal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        title="Add Team Member"
      >
        <form onSubmit={handleAddMember}>
          <div style={{ marginBottom: '15px' }}>
            <label>Member Name *</label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Enter member name"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Email *</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="Enter email address"
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Role *</label>
            <Select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            >
              <option value="member">Member</option>
              <option value="lead">Team Lead</option>
            </Select>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddMemberModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default ManagerTeamMembersPage;
