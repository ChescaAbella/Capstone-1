import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout, Container } from '../components/Layout';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { initiateGoogleLogin } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'MEMBER',
  });

  const handleGoogleSignup = () => {
    setGoogleLoading(true);
    setError('');
    try {
      initiateGoogleLogin();
    } catch (err) {
      setError(err.message || 'Failed to initiate Google signup');
      setGoogleLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.email.endsWith('@cit.edu')) {
      setError('Please use a valid school email address (must end with @cit.edu)');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setEmailLoading(true);

    try {
      const { confirmPassword, ...signupData } = formData;
      const result = await signup(signupData);

      if (result.success) {
        // For email/password signups, redirect to verification pending page
        navigate('/verification-pending');
      }
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Container>
        <div className="auth-card">
          <div className="auth-header">
            <h1>📦 DeliverEase</h1>
            <p>Create Your Account</p>
          </div>

          {error && (
            <Alert
              type="danger"
              title="Registration Failed"
              message={error}
              onClose={() => setError('')}
            />
          )}

          <div className="auth-form">
            <p className="auth-subtitle">Sign up with your school email</p>

            {/* Email/Password Signup Form */}
            <form onSubmit={handleEmailSignup}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">School Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@cit.edu"
                  className="form-input"
                />
                <small className="form-hint">
                  Must use your school email (@cit.edu)
                  {formData.email && (
                    <span style={{marginLeft: '0.5rem'}}>
                      {formData.email.endsWith('@cit.edu') ? '✅' : '❌'}
                    </span>
                  )}
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="MEMBER">Member</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className="form-input"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={emailLoading}
                style={{ marginTop: '1rem' }}
              >
                {emailLoading ? 'Creating account...' : 'Sign up'}
              </Button>
            </form>

            {/* Divider */}
            <div className="auth-divider">
              <span>OR</span>
            </div>

            {/* Google OAuth Button */}
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={handleGoogleSignup}
              disabled={googleLoading}
            >
              {googleLoading ? 'Redirecting...' : '🔐 Sign up with Google'}
            </Button>

            {/* Login link */}
            <div className="auth-footer" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <p>
                Already have an account? <Link to="/login">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </Container>
    </AuthLayout>
  );
};