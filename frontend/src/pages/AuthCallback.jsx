import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { parseAuthCallback } from '../services/authService';
import { Alert } from '../components/Alert';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const { loginWithOAuth } = useAuth();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(true);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      try {
        console.log('🔄 AuthCallback: Starting...');
        console.log('🔍 Full URL:', window.location.href);
        console.log('🔍 Search params:', window.location.search);
        
        // Parse tokens from URL
        const { token, refreshToken, role, error: urlError, message } = parseAuthCallback();
        
        console.log('🔍 Parsed data:', { 
          hasToken: !!token, 
          tokenPreview: token?.substring(0, 20),
          hasRefreshToken: !!refreshToken,
          role,
          error: urlError,
          message 
        });

        // Check for errors in URL
        if (urlError) {
          console.error('❌ OAuth error from URL:', urlError, message);
          setError(message || urlError);
          setProcessing(false);
          setTimeout(() => navigate('/login', { replace: true }), 3000);
          return;
        }

        // Check if tokens are present
        if (!token || !refreshToken) {
          console.error('❌ Missing tokens!', { hasToken: !!token, hasRefreshToken: !!refreshToken });
          setError('Authentication failed - missing credentials');
          setProcessing(false);
          setTimeout(() => navigate('/login', { replace: true }), 3000);
          return;
        }

        console.log('✅ Tokens parsed successfully');
        console.log('🔍 Token preview:', token.substring(0, 50) + '...');
        console.log('🔍 Role:', role);
        
        // Login with tokens
        console.log('🔄 Calling loginWithOAuth...');
        await loginWithOAuth(token, refreshToken, role);
        console.log('✅ Login completed successfully');
        
        // Redirect based on role
        const dashboardPath = getDashboardPath(role);
        console.log('🔄 Redirecting to:', dashboardPath);
        navigate(dashboardPath, { replace: true });
      } catch (err) {
        console.error('❌ Auth callback error:', err);
        console.error('❌ Error stack:', err.stack);
        setError(err.message || 'Authentication failed');
        setProcessing(false);
        
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, []);

  const getDashboardPath = (role) => {
    const roleMap = {
      'MEMBER': '/dashboard/member',
      'MANAGER': '/dashboard/manager',
      'ADMIN': '/dashboard/admin',
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
