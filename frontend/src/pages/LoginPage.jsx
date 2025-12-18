import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { AuthLayout, Container } from '../components/Layout';
import { Button } from '../components/Button';
import { Input, Select } from '../components/Input';
import { Alert } from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import { GOOGLE_CLIENT_ID } from '../services/googleOAuth';
import './Auth.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('contributor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Call backend API
    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, role }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.error || 'Invalid credentials');
          });
        }
        return res.json();
      })
      .then((data) => {
        login(email, password, data.user);
        
        // Redirect to dashboard (role-based routing happens in App.jsx)
        navigate('/dashboard');
      })
      .catch((err) => {
        setError(err.message || 'Login failed. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    setError('');
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Google login failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
    setGoogleLoading(false);
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

          <form onSubmit={handleLogin} className="auth-form">
            <Input
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || googleLoading}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || googleLoading}
            />

            <Select
              label="Role"
              options={[
                { value: 'contributor', label: 'Contributor / Submitter' },
                { value: 'manager', label: 'Manager / Coordinator' },
                { value: 'admin', label: 'Administrator' },
              ]}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading || googleLoading}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading || googleLoading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>OR</span>
          </div>

          {/* Google Sign-In */}
          {GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID' ? (
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <div className="google-login-container">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  theme="outline"
                  size="large"
                  width="100%"
                />
              </div>
            </GoogleOAuthProvider>
          ) : (
            <div className="auth-notice">
              <p>⚠️ Google OAuth not configured. Set VITE_GOOGLE_CLIENT_ID environment variable.</p>
            </div>
          )}

          <div className="auth-footer">
            <p>
              Don't have an account? <Link to="/register">Sign Up</Link>
            </p>
          </div>
        </div>
      </Container>
    </AuthLayout>
  );
};
