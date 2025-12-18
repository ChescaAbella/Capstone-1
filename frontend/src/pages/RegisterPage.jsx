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
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    team: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setSuccess('');
    setLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
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

    // Call backend API
    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        studentId: formData.studentId,
        team: formData.team,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.error || 'Registration failed');
          });
        }
        return res.json();
      })
      .then((data) => {
        setSuccess('Registration successful! Check your email to verify your account.');
        // Clear form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          studentId: '',
          team: '',
        });
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      })
      .catch((err) => {
        setError(err.message || 'Registration failed. Please try again.');
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

          {success && (
            <Alert
              type="success"
              title="Success"
              message={success}
              onClose={() => setSuccess('')}
            />
          )}

          <form onSubmit={handleRegister} className="auth-form">
            <Input
              label="Full Name"
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              required
            />

            <Input
              label="Email (Institutional)"
              type="email"
              name="email"
              placeholder="john@school.edu"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />

            <Input
              label="Student ID (Optional)"
              type="text"
              name="studentId"
              placeholder="2024-001"
              value={formData.studentId}
              onChange={handleChange}
              disabled={loading}
            />

            <Input
              label="Team (Optional)"
              type="text"
              name="team"
              placeholder="Team A"
              value={formData.team}
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
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              required
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
        </div>
      </Container>
    </AuthLayout>
  );
};
