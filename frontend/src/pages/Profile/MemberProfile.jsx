import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/Navbar';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Alert } from '../../components/Alert';
import '../Profile.css';

const MemberProfile = ({ userId }) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    memberId: '',
    team: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/users/${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load profile');
      }

      const data = await response.json();
      setFormData({
        name: data.name || '',
        email: data.email || '',
        memberId: data.memberId || '',
        team: data.team || '',
        phone: data.phone || '',
      });
      setAvatarPreview(data.photoUrl || null);
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile) return;
    setError('');
    setSuccess('');
    setUploading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('photo', selectedFile);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/users/${userId}/photo`,
        {
          method: 'PUT',
          body: formDataObj,
        }
      );

      if (!response.ok) throw new Error('Failed to upload photo');

      const updatedProfile = await response.json();
      updateUser(updatedProfile);
      setSuccess('Profile photo updated successfully!');
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      setError('Failed to upload profile photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.memberId || !formData.team) {
      setError('All fields are required');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/users/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            memberId: formData.memberId,
            team: formData.team,
            phone: formData.phone,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to update profile');

      const updatedProfile = await response.json();
      updateUser(updatedProfile);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateAccount = () => {
    setShowDeactivateModal(true);
  };

  const confirmDeactivate = async () => {
    try {
      setError('');
      setSaving(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/users/${userId}/deactivate`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to deactivate account');

      setSuccess('Account deactivated successfully. You will be logged out.');
      setTimeout(() => {
        localStorage.clear();
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setError('Failed to deactivate account');
      setSaving(false);
      setShowDeactivateModal(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="profile-container">
          <div className="profile-loading">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {avatarPreview ? (
                <img src={avatarPreview} alt={formData.name} />
              ) : (
                <div className="avatar-placeholder">
                  {formData.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
            </div>

            <div className="profile-info">
              <h2>{formData.name || 'Member'}</h2>
              <p className="profile-email">{formData.email}</p>
              <span className="profile-role-badge">Member</span>
            </div>

            <div className="profile-avatar-actions">
              <label className="upload-avatar-label">
                Change photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </label>

              {selectedFile && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAvatarUpload}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Save Photo'}
                </Button>
              )}
            </div>
          </div>

          {error && (
            <Alert
              type="danger"
              title="Error"
              message={error}
              onClose={() => setError('')}
            />
          )}

          {success && (
            <Alert
              type="success"
              title="Success"
              message={success}
              onClose={() => setSuccess('')}
            />
          )}

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h3>Personal Information</h3>

              <Input
                label="Full Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                disabled={saving}
                required
              />

              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                disabled={true}
              />

              <Input
                label="Member ID"
                type="text"
                name="memberId"
                value={formData.memberId}
                onChange={handleChange}
                placeholder="2024-001"
                disabled={true}
                required
              />

              <Input
                label="Team"
                type="text"
                name="team"
                value={formData.team}
                onChange={handleChange}
                placeholder="e.g., Team A"
                disabled={saving}
                required
              />

              <Input
                label="Phone Number"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                disabled={saving}
              />
            </div>

            <div className="form-actions">
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>

              <Button
                type="button"
                variant="danger"
                onClick={handleDeactivateAccount}
                disabled={saving}
                style={{
                  marginTop: '10px',
                }}
              >
                Deactivate My Account
              </Button>
            </div>
          </form>
        </div>

        <div className="profile-sidebar">
          <div className="info-card">
            <h3>Account Status</h3>
            <div className="status-item">
              <span className="status-label">Status: </span>
              <span className="status-badge active">Active</span>
            </div>
            <div className="status-item">
              <span className="status-label">Role: </span>
              <span>Member</span>
            </div>
            <div className="status-item">
              <span className="status-label">Team: </span>
              <span className="team-code">
                {formData.team || 'Not set'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showDeactivateModal && (
        <div className="modal-overlay" onClick={() => setShowDeactivateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Deactivate Account</h2>
            <p>
              Are you sure you want to deactivate your account? You will be logged out and cannot access the system until reactivated by an administrator.
            </p>
            <div className="modal-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowDeactivateModal(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={confirmDeactivate}
                disabled={saving}
              >
                {saving ? 'Deactivating...' : 'Deactivate'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberProfile;
