import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { parseAuthCallback } from '../services/googleOAuth';
import { Alert } from '../components/Alert';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Parse tokens from URL
        const { token, refreshToken, role } = parseAuthCallback();
        
        // Login with tokens
        await login(token, refreshToken, role);
        
        // Redirect based on role
        const dashboardPath = getDashboardPath(role);
        navigate(dashboardPath, { replace: true });
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed');
        setProcessing(false);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [login, navigate]);

  const getDashboardPath = (role) => {
    const roleMap = {
      'STUDENT': '/dashboard/member',
      'LEADER': '/dashboard/manager',
      'ADVISER': '/dashboard/admin',
    };
    return roleMap[role] || '/dashboard';
  };

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        padding: '20px'
      }}>
        <div style={{ maxWidth: '500px', width: '100%' }}>
          <Alert
            type="danger"
            title="Authentication Failed"
            message={error}
          />
          <p style={{ textAlign: 'center', marginTop: '20px' }}>
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh' 
    }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <h2>Authenticating...</h2>
        <p>Please wait while we complete your login.</p>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};