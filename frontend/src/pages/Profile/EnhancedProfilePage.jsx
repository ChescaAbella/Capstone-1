import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Alert } from '../../components/Alert';
import './EnhancedProfile.css';

export const EnhancedProfilePage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    department: '',
    bio: '',
    studentId: '',
    yearLevel: '',
    picture: ''
  });

  // Load profile data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        department: user.department || '',
        bio: user.bio || '',
        studentId: user.studentId || '',
        yearLevel: user.yearLevel || '',
        picture: user.picture || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: profileData.name,
          phoneNumber: profileData.phoneNumber,
          department: profileData.department,
          bio: profileData.bio,
          studentId: profileData.studentId,
          yearLevel: profileData.yearLevel,
          picture: profileData.picture
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      console.log('Profile updated:', data);
      
      setSuccess(true);
      setEditing(false);
      
      // Refresh user data in context
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original user data
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        department: user.department || '',
        bio: user.bio || '',
        studentId: user.studentId || '',
        yearLevel: user.yearLevel || '',
        picture: user.picture || ''
      });
    }
    setEditing(false);
    setError(null);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">        <Button 
          variant="secondary" 
          onClick={() => navigate('/dashboard')}
          style={{ marginBottom: '1rem' }}
        >
          ← Back to Dashboard
        </Button>        <h1>My Profile</h1>
        {!editing && (
          <Button onClick={() => setEditing(true)}>
            ✏️ Edit Profile
          </Button>
        )}
      </div>

      {success && (
        <Alert type="success">
          Profile updated successfully!
        </Alert>
      )}

      {error && (
        <Alert type="error">
          {error}
        </Alert>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="profile-form">
          {/* Profile Picture */}
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {profileData.picture ? (
                <img src={profileData.picture} alt="Profile" />
              ) : (
                <div className="avatar-placeholder">
                  {profileData.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div className="avatar-info">
              <h2>{profileData.name}</h2>
              <p className="user-role-badge">{user.role}</p>
              <p className="user-email">{profileData.email}</p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label>Full Name *</label>
              <Input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleChange}
                disabled={!editing}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <Input
                type="email"
                value={profileData.email}
                disabled
                className="disabled-input"
              />
              <small>Email cannot be changed</small>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <Input
                type="tel"
                name="phoneNumber"
                value={profileData.phoneNumber}
                onChange={handleChange}
                disabled={!editing}
                placeholder="+63 123 456 7890"
              />
            </div>
          </div>

          {/* Academic Information */}
          <div className="form-section">
            <h3>Academic Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Student ID</label>
                <Input
                  type="text"
                  name="studentId"
                  value={profileData.studentId}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="2024-001234"
                />
              </div>

              <div className="form-group">
                <label>Department</label>
                <Input
                  type="text"
                  name="department"
                  value={profileData.department}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Computer Science"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Year Level</label>
              {editing ? (
                <select
                  name="yearLevel"
                  value={profileData.yearLevel}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select Year Level</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Graduate">Graduate</option>
                </select>
              ) : (
                <Input
                  type="text"
                  value={profileData.yearLevel || 'Not specified'}
                  disabled
                />
              )}
            </div>
          </div>

          {/* Bio Section */}
          <div className="form-section">
            <h3>About Me</h3>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Tell us about yourself..."
                rows={5}
                className="textarea"
              />
            </div>
          </div>

          {/* Action Buttons */}
          {editing && (
            <div className="form-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};
