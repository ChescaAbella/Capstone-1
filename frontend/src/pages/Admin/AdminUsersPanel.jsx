import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Input, Select } from '../../components/Input';
import { Alert } from '../../components/Alert';
import { Table } from '../../components/Table';
import './AllUsers.css';

export const AdminUsersPanel = () => {
  const { getAuthHeader } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'MEMBER',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/admin/users`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchUsers();
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/admin/users/search?query=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
        }
      );

      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Search failed');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/admin/users`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      setSuccess('User created successfully');
      setShowCreateModal(false);
      setFormData({ name: '', email: '', password: '', role: 'MEMBER' });
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/admin/users/${selectedUser.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            role: formData.role,
          }),
        }
      );

      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      setSuccess('User updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to update user');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/admin/users/${userId}/role`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      setSuccess('Role updated successfully');
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to update role');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/admin/users/${userId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
        }
      );

      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      setSuccess(data.message);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to update status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/admin/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
        }
      );

      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      setSuccess('User deleted successfully');
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
    setShowEditModal(true);
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    {
      key: 'role',
      header: 'Role',
      render: (user) => (
        <select
          value={user.role}
          onChange={(e) => handleChangeRole(user.id, e.target.value)}
          className="role-select"
        >
          <option value="MEMBER">Member</option>
          <option value="MANAGER">Manager</option>
          <option value="ADMIN">Admin</option>
        </select>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => {
        const isActive = user?.active !== false; // Default to true if undefined
        return (
          <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      key: 'authProvider',
      header: 'Auth',
      render: (user) => (
        <span className="auth-badge">{user?.authProvider || 'LOCAL'}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user) => {
        const isActive = user?.active !== false; // Default to true if undefined
        return (
          <div className="action-buttons">
            <Button
              variant="secondary"
              size="small"
              onClick={() => openEditModal(user)}
            >
              Edit
            </Button>
            <Button
              variant={isActive ? 'warning' : 'success'}
              size="small"
              onClick={() => handleToggleStatus(user.id)}
            >
              {isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              variant="danger"
              size="small"
              onClick={() => handleDeleteUser(user.id)}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="admin-users-panel">
      <div className="panel-breadcrumb">
        <Button variant="secondary" size="small" onClick={() => navigate('/dashboard/admin')}>
          ← Back to Dashboard
        </Button>
      </div>

      <div className="panel-header">
        <h2>👥 User Management</h2>
        <Button onClick={() => setShowCreateModal(true)}>
          + Add User
        </Button>
      </div>

      {error && (
        <Alert type="danger" message={error} onClose={() => setError('')} />
      )}
      {success && (
        <Alert type="success" message={success} onClose={() => setSuccess('')} />
      )}

      <form onSubmit={handleSearch} className="search-form">
        <Input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button type="submit">Search</Button>
        {searchTerm && (
          <Button
            variant="secondary"
            onClick={() => {
              setSearchTerm('');
              fetchUsers();
            }}
          >
            Clear
          </Button>
        )}
      </form>

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <Table columns={columns} data={users} />
      )}

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({ name: '', email: '', password: '', role: 'MEMBER' });
        }}
        title="Create New User"
      >
        <form onSubmit={handleCreateUser} className="user-form">
          <Input
            label="Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <div className="form-group">
            <label>Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="form-select"
            >
              <option value="MEMBER">Member</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="modal-actions">
            <Button type="submit">Create User</Button>
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        title="Edit User"
      >
        <form onSubmit={handleUpdateUser} className="user-form">
          <Input
            label="Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <div className="form-group">
            <label>Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="form-select"
            >
              <option value="MEMBER">Member</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="modal-actions">
            <Button type="submit">Update User</Button>
            <Button
              variant="secondary"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
