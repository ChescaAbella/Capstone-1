import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout, Container } from '../components/Layout';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { initiateGoogleLogin } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setError('');
    try {
      initiateGoogleLogin();
    } catch (err) {
      setError(err.message || 'Failed to initiate Google login');
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

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setEmailLoading(true);

    try {
      console.log('🔄 Login attempt with:', formData.email);
      const result = await login(formData);
      console.log('✅ Login result:', result);
      
      if (result.success && result.user) {
        console.log('👤 User role:', result.user.role);
        
        // Redirect based on role - Match your App.jsx routes
        const roleRoutes = {
          STUDENT: '/dashboard/member',
          LEADER: '/dashboard/manager',
          ADVISER: '/dashboard/admin',
        };
        
        const targetRoute = roleRoutes[result.user.role] || '/dashboard';
        console.log('🔄 Redirecting to:', targetRoute);
        navigate(targetRoute, { replace: true });
      } else {
        console.error('❌ Login succeeded but no user data');
        setError('Login succeeded but user data is missing');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
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
            <p>Intelligent Deliverable Submission & Tracking System</p>
          </div>

          {error && (
            <Alert
              type="danger"
              title="Login Failed"
              message={error}
              onClose={() => setError('')}
            />
          )}

          <div className="auth-form">
            <p className="auth-subtitle">Sign in to your account</p>

            {/* Email/Password Login Form */}
            <form onSubmit={handleEmailLogin}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@yourschool.edu"
                  className="form-input"
                />
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
                  placeholder="Enter your password"
                  className="form-input"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={emailLoading}
              >
                {emailLoading ? 'Signing in...' : 'Sign in with Email'}
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
              onClick={handleGoogleLogin}
              disabled={googleLoading}
            >
              {googleLoading ? 'Redirecting...' : '🔐 Sign in with Google'}
            </Button>

            {/* Sign up link */}
            <p className="auth-link">
              Don't have an account?{' '}
              <Link to="/signup">Sign up here</Link>
            </p>
          </div>
        </div>
      </Container>
    </AuthLayout>
  );
};