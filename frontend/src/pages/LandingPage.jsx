import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout, Container } from '../components/Layout';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardBody, CardHeader } from '../components/Card';
import './Auth.css';

export const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Predictions',
      description: 'Smart AI predicts submission risks and sends intelligent reminders',
    },
    {
      icon: '📊',
      title: 'Real-time Dashboard',
      description: 'Track deliverables, submissions, and progress with live analytics',
    },
    {
      icon: '📤',
      title: 'Secure Submission',
      description: 'Document validation and secure file upload with version control',
    },
    {
      icon: '🔔',
      title: 'Smart Notifications',
      description: 'Multi-channel reminders before critical deadlines',
    },
    {
      icon: '👥',
      title: 'Team Management',
      description: 'Collaborate seamlessly with team members and track accountability',
    },
    {
      icon: '📈',
      title: 'Advanced Analytics',
      description: 'Detailed insights on submission patterns and team performance',
    },
  ];

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-container">
          <div className="header-brand">
            <span className="brand-icon">📦</span>
            <h1>DeliverEase</h1>
          </div>
          <div className="header-buttons">
            <Button variant="outline" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button variant="primary" onClick={() => navigate('/register')}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="landing-container">
          <div className="hero-content">
            <h2>Intelligent Deliverable Tracking System</h2>
            <p>
              Streamline submission management with AI-powered predictions, document validation,
              and smart reminders. DeliverEase reduces manual work, eliminates late submissions,
              and improves accountability across teams and organizations.
            </p>
            <div className="hero-buttons">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/register')}
              >
                Start Free
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/login')}
              >
                Learn More
              </Button>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-placeholder">
              <span>📦</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="landing-container">
          <h2>Why Choose DeliverEase?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <Card key={index} className="feature-card">
                <CardBody>
                  <div className="feature-icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For Everyone Section */}
      <section className="for-everyone-section">
        <div className="landing-container">
          <h2>Built for Everyone</h2>
          <div className="roles-grid">
            <Card className="role-card">
              <CardBody>
                <h3>📦 Contributors</h3>
                <p>Submit deliverables confidently with validation and feedback</p>
                <ul>
                  <li>Easy file uploads</li>
                  <li>Track submission status</li>
                  <li>Receive feedback</li>
                </ul>
              </CardBody>
            </Card>
            <Card className="role-card">
              <CardBody>
                <h3>👥 Managers</h3>
                <p>Create, manage, and track deliverables with full visibility</p>
                <ul>
                  <li>Create deliverables</li>
                  <li>Track submissions</li>
                  <li>Team insights</li>
                </ul>
              </CardBody>
            </Card>
            <Card className="role-card">
              <CardBody>
                <h3>⚙️ Administrators</h3>
                <p>Manage the platform, users, and view system-wide analytics</p>
                <ul>
                  <li>User management</li>
                  <li>System reports</li>
                  <li>Settings control</li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="landing-container">
          <h2>Ready to Take Control of Your Deliverables?</h2>
          <p>Start using DeliverEase to streamline your submission workflow</p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/register')}
          >
            Create Your Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <p>&copy; 2025 DeliverEase. Intelligent Deliverable Tracking System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
