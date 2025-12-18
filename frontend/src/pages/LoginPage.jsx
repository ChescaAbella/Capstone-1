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
        login(data.token, data.user, role);
        
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
        </div>
      </Container>
    </AuthLayout>
  );
};
