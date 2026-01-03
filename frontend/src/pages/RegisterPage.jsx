import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout, Container } from '../components/Layout';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { initiateGoogleLogin } from '../services/googleOAuth';
import './Auth.css';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignup = () => {
    setGoogleLoading(true);
    setError('');
    try {
      // Redirect to backend OAuth (same as login)
      initiateGoogleLogin();
    } catch (err) {
      setError(err.message || 'Failed to initiate Google signup');
      setGoogleLoading(false);
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
            <p className="auth-subtitle">
              Sign up with your institutional Gmail account
            </p>
            
            <div className="auth-info-box" style={{
              backgroundColor: '#e3f2fd',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              color: '#1976d2'
            }}>
              <strong>ℹ️ Note:</strong> New users will be automatically registered 
              when they sign in with Google for the first time. Your account will 
              be created with STUDENT role by default.
            </div>

            <Button
              type="button"
              variant="primary"
              fullWidth
              onClick={handleGoogleSignup}
              disabled={googleLoading}
            >
              {googleLoading ? 'Redirecting...' : '🔐 Sign up with Google'}
            </Button>

            <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
              <p>
                By signing up, you agree to use your institutional email address 
                and accept our terms of service.
              </p>
            </div>
          </div>

          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </div>
        </div>
      </Container>
    </AuthLayout>
  );
};