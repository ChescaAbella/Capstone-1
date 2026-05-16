import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../Dashboard/DashboardLayout';
import './History.css';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockSubmissions = [
        {
          id: 1,
          title: 'Introduction to React',
          course: 'WEB 101',
          submittedDate: '2024-12-15',
          submittedTime: '14:30',
          dueDate: '2024-12-20',
          status: 'completed',
          fileName: 'React_Assignment.pdf',
          fileSize: '2.5 MB',
          grade: 'A',
          feedback: 'Great implementation of hooks and state management!'
        },
        {
          id: 2,
          title: 'Data Structures Project',
          course: 'CS 201',
          submittedDate: '2024-12-10',
          submittedTime: '09:15',
          dueDate: '2024-12-12',
          status: 'completed',
          fileName: 'DataStructures.zip',
          fileSize: '5.2 MB',
          grade: 'A-',
          feedback: 'Good work. Consider optimizing the search algorithm.'
        },
        {
          id: 3,
          title: 'Web Development Assignment',
          course: 'WEB 301',
          submittedDate: '2024-12-08',
          submittedTime: '16:45',
          dueDate: '2024-12-08',
          status: 'submitted',
          fileName: 'WebApp.zip',
          fileSize: '8.1 MB',
          grade: null,
          feedback: 'Pending review'
        },
        {
          id: 4,
          title: 'Database Design',
          course: 'DB 301',
          submittedDate: '2024-12-05',
          submittedTime: '11:20',
          dueDate: '2024-12-10',
          status: 'completed',
          fileName: 'Database_Schema.pdf',
          fileSize: '1.8 MB',
          grade: 'B+',
          feedback: 'Well-structured schema. Good normalization.'
        },
        {
          id: 5,
          title: 'Python Programming Task',
          course: 'PY 101',
          submittedDate: '2024-11-28',
          submittedTime: '13:00',
          dueDate: '2024-12-01',
          status: 'completed',
          fileName: 'PythonTask.py',
          fileSize: '45 KB',
          grade: 'A',
          feedback: 'Excellent code quality and documentation!'
        }
      ];

      setSubmissions(mockSubmissions);
      setError('');
    } catch (err) {
      setError('Failed to load submission history');
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#28a745';
      case 'submitted':
        return '#ffc107';
      case 'late':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      completed: 'Graded',
      submitted: 'Under Review',
      late: 'Late Submission'
    };
    return labels[status] || status;
  };

  const filteredSubmissions = filterStatus === 'all' 
    ? submissions 
    : submissions.filter(sub => sub.status === filterStatus);

  return (
    <DashboardLayout>
      <div className="history-page">
        <div className="history-header">
          <h1>Submission History</h1>
          <p>View all your submitted assignments and grades</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="history-controls">
          <div className="filter-group">
            <label htmlFor="status-filter">Filter by Status:</label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Submissions</option>
              <option value="completed">Graded</option>
              <option value="submitted">Under Review</option>
            </select>
          </div>

          <div className="result-count">
            {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''}
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading submission history...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No submissions found</h3>
            <p>Start submitting assignments to see them here</p>
          </div>
        ) : (
          <div className="submissions-container">
            {filteredSubmissions.map((submission) => (
              <div key={submission.id} className="submission-card">
                <div className="submission-header">
                  <div className="submission-title-group">
                    <h3 className="submission-title">{submission.title}</h3>
                    <span className="course-code">{submission.course}</span>
                  </div>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(submission.status) }}
                  >
                    {getStatusLabel(submission.status)}
                  </span>
                </div>

                <div className="submission-meta">
                  <div className="meta-item">
                    <span className="meta-label">Submitted</span>
                    <span className="meta-value">
                      {new Date(submission.submittedDate).toLocaleDateString()} at {submission.submittedTime}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Due Date</span>
                    <span className="meta-value">
                      {new Date(submission.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">File</span>
                    <span className="meta-value">{submission.fileName} ({submission.fileSize})</span>
                  </div>
                </div>

                <div className="submission-content">
                  {submission.grade && (
                    <div className="grade-section">
                      <div className="grade-box">
                        <span className="grade-label">Grade</span>
                        <span className="grade-value">{submission.grade}</span>
                      </div>
                    </div>
                  )}

                  {submission.feedback && (
                    <div className="feedback-section">
                      <h4 className="feedback-label">
                        {submission.status === 'submitted' ? 'Status Update' : 'Feedback'}
                      </h4>
                      <p className="feedback-text">{submission.feedback}</p>
                    </div>
                  )}
                </div>

                <div className="submission-actions">
                  <button className="action-btn download-btn">
                    <span className="icon">⬇️</span>
                    Download Submission
                  </button>
                  {submission.grade && (
                    <button className="action-btn details-btn">
                      <span className="icon">📄</span>
                      View Detailed Feedback
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HistoryPage;
