import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout, Container } from '../components/Layout';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { initiateGoogleLogin } from '../services/googleOAuth';
import './Auth.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setError('');
    try {
      // Redirect to backend OAuth
      initiateGoogleLogin();
    } catch (err) {
      setError(err.message || 'Failed to initiate Google login');
      setGoogleLoading(false);
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
            <p className="auth-subtitle">Sign in with your institutional Gmail account</p>

            <Button
              type="button"
              variant="primary"
              fullWidth
              onClick={handleGoogleLogin}
              disabled={googleLoading}
            >
              {googleLoading ? 'Redirecting...' : '🔐 Sign in with Google'}
            </Button>
          </div>

          <div className="auth-footer">
            <p>
              By signing in, you agree to use your institutional email address
            </p>
          </div>
        </div>
      </Container>
    </AuthLayout>
  );
};