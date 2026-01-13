import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Container, AuthLayout } from '../components/Layout';
import './Auth.css';

export const VerificationPendingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/resend-verification?email=${encodeURIComponent(user.email)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to resend verification');
      }

      const data = await response.json();
      setMessage(data.message);
      console.log('✅ Resend response:', data);
    } catch (error) {
      console.error('❌ Resend error:', error);
      setMessage(error.message || 'Failed to resend. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (user.emailVerified) {
    // Auto-redirect to dashboard if already verified
    setTimeout(() => {
      const roleRoutes = {
        MEMBER: '/dashboard/member',
        MANAGER: '/dashboard/manager',
        ADMIN: '/dashboard/admin',
      };
      navigate(roleRoutes[user.role] || '/dashboard');
    }, 1000);
  }

  return (
    <AuthLayout>
      <Container>
        <div className="auth-card">
          <div className="auth-header">
            <h1>📧 Verify Your Email</h1>
            <p>Almost there!</p>
          </div>

          {message && (
            <Alert
              type="info"
              title="Verification Sent"
              message={message}
              onClose={() => setMessage('')}
            />
          )}

          <div className="auth-form" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
              A verification email has been sent to <strong>{user.email}</strong>
            </p>

            <p style={{ color: '#666', marginBottom: '2rem' }}>
              Please click the link in the email to verify your account.
              <br />
              <small>The link will expire in 24 hours.</small>
            </p>

            <div style={{ padding: '1.5rem', backgroundColor: '#f5f5f5', borderRadius: '8px', marginBottom: '2rem' }}>
              <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                <strong>Dev Mode:</strong> Check your console for the verification link
              </p>
              <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: 0 }}>
                Or use the resend button below
              </p>
            </div>

            <Button
              variant="primary"
              onClick={handleResendVerification}
              disabled={loading}
              fullWidth
            >
              {loading ? 'Resending...' : 'Resend Verification Email'}
            </Button>

            <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
              Already verified?{' '}
              <button
                onClick={() => {
                  const roleRoutes = {
                    MEMBER: '/dashboard/member',
                    MANAGER: '/dashboard/manager',
                    ADMIN: '/dashboard/admin',
                  };
                  navigate(roleRoutes[user.role] || '/dashboard');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#007bff',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Go to Dashboard
              </button>
            </p>
          </div>
        </div>
      </Container>
    </AuthLayout>
  );
};
