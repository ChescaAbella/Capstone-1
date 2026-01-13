import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Table } from '../../components/Table';
import './AdminAuditLogs.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const AdminAuditLogs = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState(null);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Fetch audit logs
  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setLoading(true);
        console.log('Token available:', !!token);
        console.log('Token value:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
        
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        console.log('Fetching audit logs with headers:', headers);

        const response = await fetch(`${API_URL}/api/admin/audit-logs/recent?limit=100`, {
          headers
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error('Session expired. Please log out and log back in.');
          }
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
          throw new Error(`Failed to fetch audit logs: ${response.status}`);
        }

        const data = await response.json();
        console.log('Audit logs data:', data);
        setAuditLogs(data.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching audit logs:', err);
        setError(err.message);
        setAuditLogs([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'ADMIN' && token) {
      fetchAuditLogs();
    }
  }, [user, token]);

  // Fetch statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const response = await fetch(`${API_URL}/api/admin/audit-logs/statistics`, {
          headers
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch statistics:', err);
      }
    };

    if (user?.role === 'ADMIN' && token) {
      fetchStats();
    }
  }, [user, token]);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // Reset to all logs
      try {
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const response = await fetch(`${API_URL}/api/admin/audit-logs/recent?limit=100`, {
          headers
        });

        if (response.ok) {
          const data = await response.json();
          setAuditLogs(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch logs:', err);
      }
      return;
    }

    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`${API_URL}/api/admin/audit-logs/search?query=${encodeURIComponent(searchQuery)}`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.data || []);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed');
    }
  };

  // Handle filter by status
  const handleFilterStatus = async (status) => {
    setFilterStatus(status);

    if (status === 'all') {
      try {
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const response = await fetch(`${API_URL}/api/admin/audit-logs/recent?limit=100`, {
          headers
        });

        if (response.ok) {
          const data = await response.json();
          setAuditLogs(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch logs:', err);
      }
    } else {
      try {
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const response = await fetch(`${API_URL}/api/admin/audit-logs/status/${status === 'success'}`, {
          headers
        });

        if (response.ok) {
          const data = await response.json();
          setAuditLogs(data.data || []);
        } else if (response.status === 401 || response.status === 403) {
          setError('Session expired. Please log out and log back in.');
        }
      } catch (err) {
        console.error('Filter failed:', err);
        setError(err.message || 'Filter failed');
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Table columns
  const columns = [
    { key: 'loginTime', label: 'Login Time', render: (row) => formatDate(row.loginTime) },
    { key: 'username', label: 'Username' },
    { key: 'ipAddress', label: 'IP Address' },
    {
      key: 'success',
      label: 'Status',
      render: (row) => (
        <Badge status={row.success ? 'success' : 'error'}>
          {row.success ? 'Success' : 'Failed'}
        </Badge>
      )
    },
    { key: 'authProvider', label: 'Auth Provider', render: (row) => row.authProvider || 'N/A' },
    {
      key: 'failureReason',
      label: 'Reason',
      render: (row) => row.failureReason || (row.success ? '—' : 'Unknown')
    }
  ];

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="audit-logs-container">
        <Card>
          <h2>Access Denied</h2>
          <p>You do not have permission to view audit logs.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="audit-logs-container">
      <div className="audit-logs-header">
        <h1>Login Audit Logs</h1>
        <Button
          onClick={() => navigate('/dashboard/admin')}
          variant="secondary"
        >
          ← Back to Admin Dashboard
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-grid">
          <Card className="stat-card">
            <div className="stat-value">{stats.totalLogins}</div>
            <div className="stat-label">Total Logins</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value success">{stats.successfulLogins}</div>
            <div className="stat-label">Successful</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value error">{stats.failedLogins}</div>
            <div className="stat-label">Failed</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-value">{stats.successRate.toFixed(1)}%</div>
            <div className="stat-label">Success Rate</div>
          </Card>
        </div>
      )}

      {/* Search and Filter Section */}
      <Card className="search-filter-card">
        <div className="search-section">
          <div className="search-input-group">
            <Input
              type="text"
              placeholder="Search by username or IP address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>

          <div className="filter-buttons">
            <Button
              className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterStatus('all')}
              variant="secondary"
            >
              All
            </Button>
            <Button
              className={`filter-btn ${filterStatus === 'success' ? 'active' : ''}`}
              onClick={() => handleFilterStatus('success')}
              variant="secondary"
            >
              ✓ Successful
            </Button>
            <Button
              className={`filter-btn ${filterStatus === 'failed' ? 'active' : ''}`}
              onClick={() => handleFilterStatus('failed')}
              variant="secondary"
            >
              ✗ Failed
            </Button>
          </div>
        </div>
      </Card>

      {/* Logs Table */}
      <Card>
        {loading ? (
          <div className="loading">Loading audit logs...</div>
        ) : error ? (
          <div className="error">Error: {error}</div>
        ) : auditLogs.length === 0 ? (
          <div className="empty">No login attempts found.</div>
        ) : (
          <Table columns={columns} data={auditLogs} />
        )}
      </Card>
    </div>
  );
};

export default AdminAuditLogs;
