import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout, Container } from '../components/Layout';
import { Button } from '../components/Button';
import { Input, Select } from '../components/Input';
import { Alert } from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'contributor',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      // Auto-login after registration
      login(formData.email, formData.password, formData.role);
      
      // Redirect based on role
      switch (formData.role) {
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
    }, 1000);
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

          <form onSubmit={handleRegister} className="auth-form">
            <Input
              label="Full Name"
              type="text"
              name="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              disabled={loading}
            />

            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />

            <Select
              label="Role"
              name="role"
              options={[
                { value: 'contributor', label: 'Contributor / Submitter' },
                { value: 'manager', label: 'Manager / Coordinator' },
                { value: 'admin', label: 'Administrator' },
              ]}
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </div>

          <div className="auth-demo">
            <p className="demo-title">Demo Accounts:</p>
            <ul>
              <li><strong>Contributor:</strong> contributor@example.com</li>
              <li><strong>Manager:</strong> manager@example.com</li>
              <li><strong>Admin:</strong> admin@example.com</li>
            </ul>
            <p className="demo-note">Password: any 6+ character string</p>
          </div>
        </div>
      </Container>
    </AuthLayout>
  );
};
