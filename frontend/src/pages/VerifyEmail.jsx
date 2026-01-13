import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Container, AuthLayout } from '../components/Layout';
import './Auth.css';

export const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/verify-email?token=${token}`;
        console.log('🔄 Verifying email with token:', token.substring(0, 20) + '...');
        console.log('🔍 API URL:', apiUrl);

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        console.log('📥 Response status:', response.status);

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          console.error('❌ Verification error response:', error);
          throw new Error(error.message || `Server error: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Verification response:', data);

        setStatus('success');
        setMessage('Email verified successfully!');

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (error) {
        console.error('❌ Verification error:', error);
        setStatus('error');
        setMessage(error.message || 'Email verification failed. Please try again or contact support.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <AuthLayout>
      <Container>
        <div className="auth-card">
          <div className="auth-header">
            <h1>{status === 'verifying' ? '⏳' : status === 'success' ? '✅' : '❌'} Email Verification</h1>
          </div>

          <div className="auth-form" style={{ textAlign: 'center' }}>
            {status === 'verifying' && (
              <>
                <p>Verifying your email...</p>
                <div style={{
                  display: 'inline-block',
                  width: '50px',
                  height: '50px',
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #3498db',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginTop: '1rem'
                }}></div>
              </>
            )}

            {status === 'success' && (
              <>
                <p style={{ fontSize: '1.1rem', color: '#28a745', marginBottom: '1rem' }}>
                  {message}
                </p>
                <p style={{ color: '#666' }}>
                  Redirecting to login page...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <Alert
                  type="danger"
                  title="Verification Failed"
                  message={message}
                />
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                  }}
                >
                  Back to Login
                </button>
              </>
            )}
          </div>
        </div>
      </Container>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </AuthLayout>
  );
};
