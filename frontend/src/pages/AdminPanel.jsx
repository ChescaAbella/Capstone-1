import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { Input, Select } from '../components/Input';
import { Alert } from '../components/Alert';
import './AdminPanel.css';

export const AdminPanel = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'contributor',
    studentId: '',
    team: '',
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      setError('Access Denied: Admin privileges required');
      return;
    }
    fetchUsers();
    fetchAuditLogs();
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/admin/users`,
        {
          headers: {
            'X-User-Id': user.id,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/admin/audit-logs`,
        {
          headers: {
            'X-User-Id': user.id,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch audit logs');
      const data = await response.json();
      setAuditLogs(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateUser = async () => {
    setError('');
    setSuccess('');

    if (!formData.name || !formData.email) {
      setError('Name and email are required');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/admin/users`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': user.id,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      setSuccess('User created successfully');
      setShowCreateForm(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/admin/users/${userId}/role?role=${newRole}`,
        {
          method: 'PUT',
          headers: {
            'X-User-Id': user.id,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to change role');
      setSuccess('Role updated successfully');
      fetchUsers();
      fetchAuditLogs();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/admin/users/${userId}/deactivate`,
        {
          method: 'PUT',
          headers: {
            'X-User-Id': user.id,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to deactivate user');
      setSuccess('User deactivated successfully');
      fetchUsers();
      fetchAuditLogs();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReactivateUser = async (userId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/admin/users/${userId}/reactivate`,
        {
          method: 'PUT',
          headers: {
            'X-User-Id': user.id,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to reactivate user');
      setSuccess('User reactivated successfully');
      fetchUsers();
      fetchAuditLogs();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'contributor',
      studentId: '',
      team: '',
    });
    setEditingUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (user?.role !== 'admin') {
    return (
      <div>
        <Navbar />
        <div className="admin-container">
          <Alert type="danger" title="Access Denied" message="Admin privileges required" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="admin-container">
        <div className="admin-header">
          <h1>🔐 Admin Dashboard</h1>
        </div>

        {error && (
          <Alert type="danger" title="Error" message={error} onClose={() => setError('')} />
        )}
        {success && (
          <Alert type="success" title="Success" message={success} onClose={() => setSuccess('')} />
        )}

        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users Management
          </button>
          <button
            className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            Audit Logs
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'users' && (
            <div className="users-section">
              <div className="section-header">
                <h2>Registered Users</h2>
                {!showCreateForm && (
                  <Button
                    variant="primary"
                    onClick={() => setShowCreateForm(true)}
                  >
                    + Create User
                  </Button>
                )}
              </div>

              {showCreateForm && (
                <div className="create-form">
                  <h3>Create New User</h3>
                  <Input
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Full name"
                    required
                  />
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="user@school.edu"
                    required
                  />
                  <Select
                    label="Role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    options={[
                      { value: 'contributor', label: 'Contributor' },
                      { value: 'manager', label: 'Manager' },
                      { value: 'admin', label: 'Admin' },
                    ]}
                  />
                  <Input
                    label="Student ID"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    placeholder="2024-001"
                  />
                  <Input
                    label="Team"
                    name="team"
                    value={formData.team}
                    onChange={handleInputChange}
                    placeholder="Team A"
                  />
                  <div className="form-actions">
                    <Button variant="primary" onClick={handleCreateUser}>
                      Create User
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowCreateForm(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="loading">Loading users...</div>
              ) : users.length === 0 ? (
                <div className="no-data">No users found</div>
              ) : (
                <div className="users-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>
                            <select
                              value={u.role}
                              onChange={(e) => handleChangeRole(u.id, e.target.value)}
                              className="role-select"
                            >
                              <option value="contributor">Contributor</option>
                              <option value="manager">Manager</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td>
                            <span className={`status-badge ${u.active ? 'active' : 'inactive'}`}>
                              {u.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="actions">
                            {u.active ? (
                              <Button
                                size="small"
                                variant="danger"
                                onClick={() => handleDeactivateUser(u.id)}
                              >
                                Deactivate
                              </Button>
                            ) : (
                              <Button
                                size="small"
                                variant="success"
                                onClick={() => handleReactivateUser(u.id)}
                              >
                                Reactivate
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="audit-section">
              <h2>Audit Logs</h2>
              {auditLogs.length === 0 ? (
                <div className="no-data">No audit logs found</div>
              ) : (
                <div className="audit-logs">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="audit-entry">
                      <div className="entry-header">
                        <span className="action-badge">{log.action}</span>
                        <span className="timestamp">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="entry-details">
                        <p>
                          <strong>Admin:</strong> {log.adminName}
                        </p>
                        <p>
                          <strong>Target User:</strong> {log.targetUserEmail}
                        </p>
                        <p>
                          <strong>Description:</strong> {log.description}
                        </p>
                        {log.changedFields && (
                          <p>
                            <strong>Changes:</strong> {log.changedFields}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
