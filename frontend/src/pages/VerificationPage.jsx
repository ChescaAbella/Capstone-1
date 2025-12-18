import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { AuthLayout, Container } from '../components/Layout';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import './Auth.css';

export const VerificationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    // Call backend to verify token
    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/verify/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.error || 'Verification failed');
          });
        }
        return res.json();
      })
      .then(() => {
        setStatus('success');
        setMessage('Email verified successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'Email verification failed. Please try again.');
      });
  }, [token, navigate]);

  return (
    <AuthLayout>
      <Container>
        <div className="auth-card">
          <div className="auth-header">
            <h1>📦 DeliverEase</h1>
            <p>Email Verification</p>
          </div>

          {status === 'verifying' && (
            <Alert
              type="info"
              title="Verifying"
              message={message}
            />
          )}

          {status === 'success' && (
            <Alert
              type="success"
              title="Success"
              message={message}
            />
          )}

          {status === 'error' && (
            <>
              <Alert
                type="danger"
                title="Verification Failed"
                message={message}
              />
              <div className="auth-footer">
                <p>
                  <Link to="/register">Create a new account</Link> or{' '}
                  <Link to="/login">go back to login</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </Container>
    </AuthLayout>
  );
};
