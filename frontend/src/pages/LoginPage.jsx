import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout, Container } from '../components/Layout';
import { Button } from '../components/Button';
import { Input, Select } from '../components/Input';
import { Alert } from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('contributor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (email && password) {
        login(email, password, role);
        
        // Redirect based on role
        switch (role) {
          case 'contributor':
            navigate('/contributor-dashboard');
            break;
          case 'manager':
            navigate('/manager-dashboard');
            break;
          case 'admin':
            navigate('/admin-dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        setError('Please fill in all fields');
      }
      setLoading(false);
    }, 1000);
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
              disabled={loading}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
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
              disabled={loading}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account? <Link to="/register">Sign Up</Link>
            </p>
          </div>

          <div className="auth-demo">
            <p className="demo-title">Demo Credentials:</p>
            <ul>
              <li><strong>Contributor:</strong> contributor@example.com</li>
              <li><strong>Manager:</strong> manager@example.com</li>
              <li><strong>Admin:</strong> admin@example.com</li>
            </ul>
            <p className="demo-note">Any password will work</p>
          </div>
        </div>
      </Container>
    </AuthLayout>
  );
};
