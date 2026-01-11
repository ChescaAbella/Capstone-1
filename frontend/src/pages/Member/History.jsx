import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../Dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import '../Member/Deliverables.css';

const HistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      // Mock submission history data
      const mockSubmissions = [
        {
          id: 1,
          title: 'Assignment 1: Project Proposal',
          description: 'Submit your project proposal with objectives and timeline',
          deadline: '2025-01-15',
          status: 'completed',
          submittedDate: '2025-01-14',
          submittedTime: '14:30',
          fileName: 'Project_Proposal_Final.pdf',
          fileSize: '2.4 MB',
          validationStatus: 'approved',
          grade: 'A',
          feedback: 'Excellent proposal with clear objectives and timeline.',
          googleDriveLink: 'https://drive.google.com/file/d/1a2b3c4d5e6f7g8h',
          version: 1,
        },
        {
          id: 2,
          title: 'Assignment 2: Research Document',
          description: 'Complete research document with citations and analysis',
          deadline: '2025-01-22',
          status: 'completed',
          submittedDate: '2025-01-22',
          submittedTime: '09:15',
          fileName: 'Research_Paper_v2.docx',
          fileSize: '3.8 MB',
          validationStatus: 'approved',
          grade: 'B+',
          feedback: 'Good research with some missing citations. Please revise.',
          googleDriveLink: 'https://drive.google.com/file/d/2b3c4d5e6f7g8h9i',
          version: 2,
        },
        {
          id: 3,
          title: 'Assignment 3: Mid-term Presentation',
          description: 'Prepare and submit presentation slides for review',
          deadline: '2025-02-05',
          status: 'completed',
          submittedDate: '2025-02-04',
          submittedTime: '16:45',
          fileName: 'Midterm_Presentation.pptx',
          fileSize: '5.2 MB',
          validationStatus: 'approved',
          grade: 'A-',
          feedback: 'Great presentation! Consider adding more visuals next time.',
          googleDriveLink: 'https://drive.google.com/file/d/3c4d5e6f7g8h9i0j',
          version: 1,
        },
        {
          id: 4,
          title: 'Assignment 4: Code Implementation',
          description: 'Submit source code and documentation',
          deadline: '2024-12-25',
          status: 'completed',
          submittedDate: '2024-12-24',
          submittedTime: '23:59',
          fileName: 'Code_Implementation_Final.zip',
          fileSize: '15.7 MB',
          validationStatus: 'approved',
          grade: 'A',
          feedback: 'Excellent code quality and comprehensive documentation.',
          googleDriveLink: 'https://drive.google.com/file/d/4d5e6f7g8h9i0j1k',
          version: 1,
        },
        {
          id: 5,
          title: 'Assignment 5: Case Study Analysis',
          description: 'Analyze and present case study findings',
          deadline: '2024-12-18',
          status: 'completed',
          submittedDate: '2024-12-17',
          submittedTime: '10:20',
          fileName: 'Case_Study_Analysis.pdf',
          fileSize: '4.1 MB',
          validationStatus: 'pending',
          grade: null,
          feedback: 'Under review - will provide feedback by Jan 10',
          googleDriveLink: 'https://drive.google.com/file/d/5e6f7g8h9i0j1k2l',
          version: 1,
        },
      ];
      setSubmissions(mockSubmissions);
      setError('');
    } catch (err) {
      setError('Failed to load submission history');
      console.error(err);
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

  const filteredSubmissions = statusFilter === 'all' 
    ? submissions 
    : submissions.filter(sub => sub.validationStatus === statusFilter);

  const handleCardClick = (submission) => {
    setSelectedSubmission(submission);
    setShowDetailsModal(true);
  };

  const handleResubmit = () => {
    setShowResubmitModal(true);
    setShowDetailsModal(false);
  };

  const handleResubmitFile = (e) => {
    e.preventDefault();
    // Handle file upload logic here
    alert('File resubmitted successfully!');
    const updatedSubmission = {
      ...selectedSubmission,
      version: selectedSubmission.version + 1,
      submittedDate: new Date().toISOString().split('T')[0],
      submittedTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      validationStatus: 'pending',
    };
    setSubmissions(submissions.map(s => s.id === selectedSubmission.id ? updatedSubmission : s));
    setSelectedSubmission(updatedSubmission);
    setShowResubmitModal(false);
  };

  const getValidationColor = (status) => {
    switch (status) {
      case 'approved':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'rejected':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSubmissions = filteredSubmissions.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  const handleFilterChange = (newFilter) => {
    setStatusFilter(newFilter);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <DashboardLayout role={user?.role}>
        <div className="member-deliverables-page">
          <div className="loading">Loading submission history...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={user?.role}>
      <div className="member-deliverables-page">
        <div className="page-header">
          <h1>📜 Submission History</h1>
          <p>View and manage your past submissions</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {submissions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No Submissions Yet</h3>
            <p>Your completed submissions will appear here.</p>
          </div>
        ) : (
          <>
            <div className="filter-section" style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 600, marginRight: '12px' }}>Filter by Validation:</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['all', 'approved', 'pending', 'rejected'].map(status => (
                  <button
                    key={status}
                    onClick={() => handleFilterChange(status)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '4px',
                      border: statusFilter === status ? '2px solid #0066cc' : '1px solid #e0e0e0',
                      backgroundColor: statusFilter === status ? '#e6f2ff' : '#ffffff',
                      color: statusFilter === status ? '#0066cc' : '#333',
                      cursor: 'pointer',
                      fontWeight: statusFilter === status ? 600 : 400,
                      fontSize: '0.9rem',
                    }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
              <button
                onClick={() => navigate('/member/deliverables')}
                style={{
                  padding: '6px 12px',
                  marginLeft: '16px',
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0',
                  backgroundColor: '#f9f9f9',
                  color: '#333',
                  cursor: 'pointer',
                  fontWeight: 400,
                  fontSize: '0.9rem',
                }}
              >
                ↩️ Back to Deliverables
              </button>
            </div>

            <div className="deliverables-grid">
              {currentSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="deliverable-card"
                  onClick={() => handleCardClick(submission)}
                >
                  <div className="card-header">
                    <h3>{submission.title}</h3>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getValidationColor(submission.validationStatus) }}
                    >
                      {getStatusLabel(submission.validationStatus)}
                    </span>
                  </div>

                  <p className="card-description">{submission.description}</p>

                  <div className="card-footer">
                    <div className="deadline-info">
                      <span className="deadline-label">Submitted:</span>
                      <span className="deadline-date">{submission.submittedDate} {submission.submittedTime}</span>
                    </div>
                    <div className="deadline-info">
                      <span className="deadline-label">Grade:</span>
                      <span className="deadline-date">{submission.grade || '-'}</span>
                    </div>
                    <div className="deadline-info">
                      <span className="deadline-label">Version:</span>
                      <span className="deadline-date">v{submission.version}</span>
                    </div>
                  </div>

                  <div className="card-action">
                    <button className="submit-btn">📋 View Details</button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>

                <div className="pagination-info">
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title="Submission Details"
        >
          <div style={{ padding: '10px 0' }}>
            <div style={{ marginBottom: '15px' }}>
              <strong>Deliverable:</strong>
              <p style={{ margin: '5px 0 0 0', color: '#666' }}>{selectedSubmission.title}</p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>File Name:</strong>
              <p style={{ margin: '5px 0 0 0', color: '#666' }}>{selectedSubmission.fileName}</p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>File Size:</strong>
              <p style={{ margin: '5px 0 0 0', color: '#666' }}>{selectedSubmission.fileSize}</p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>Submitted Date & Time:</strong>
              <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                {selectedSubmission.submittedDate} at {selectedSubmission.submittedTime}
              </p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>Version:</strong>
              <p style={{ margin: '5px 0 0 0', color: '#666' }}>v{selectedSubmission.version}</p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>Validation Status:</strong>
              <p style={{ margin: '5px 0 0 0' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    color: 'white',
                    backgroundColor: getValidationColor(selectedSubmission.validationStatus),
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  {getStatusLabel(selectedSubmission.validationStatus)}
                </span>
              </p>
            </div>

            {selectedSubmission.grade && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Grade:</strong>
                <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '1.2rem', fontWeight: 600 }}>
                  {selectedSubmission.grade}
                </p>
              </div>
            )}

            {selectedSubmission.feedback && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Feedback:</strong>
                <p style={{ margin: '5px 0 0 0', color: '#666', fontStyle: 'italic' }}>
                  "{selectedSubmission.feedback}"
                </p>
              </div>
            )}

            <div style={{ marginBottom: '15px' }}>
              <strong>Google Drive Link:</strong>
              <p style={{ margin: '5px 0 0 0' }}>
                <a 
                  href={selectedSubmission.googleDriveLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#0066cc', textDecoration: 'none', fontWeight: 500 }}
                >
                  📁 Open in Google Drive →
                </a>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <Button
                variant="secondary"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={handleResubmit}
              >
                ✏️ Edit & Resubmit
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Resubmit Modal */}
      <Modal
        isOpen={showResubmitModal}
        onClose={() => setShowResubmitModal(false)}
        title="Resubmit File"
      >
        <form onSubmit={handleResubmitFile}>
          <div style={{ marginBottom: '15px' }}>
            <p style={{ color: '#666', marginBottom: '10px' }}>
              Deliverable: <strong>{selectedSubmission?.title}</strong>
            </p>
            <p style={{ color: '#666', marginBottom: '10px' }}>
              Current Version: <strong>v{selectedSubmission?.version}</strong> → <strong>v{(selectedSubmission?.version || 0) + 1}</strong>
            </p>
            <p style={{ color: '#666', marginBottom: '10px' }}>
              Deadline: <strong>{selectedSubmission?.deadline}</strong>
            </p>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 600 }}>Upload New File *</label>
            <div style={{
              border: '2px dashed #0066cc',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              marginTop: '8px',
              backgroundColor: '#f0f7ff',
              transition: 'all 0.3s ease',
            }}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById('file-input').click()}
            >
              <p style={{ color: '#0066cc', margin: '0 0 5px 0', fontWeight: 600 }}>
                📤 Click to upload or drag and drop
              </p>
              <p style={{ color: '#999', margin: '5px 0 0 0', fontSize: '0.9rem' }}>
                PDF, DOCX, PPTX (Max 20MB)
              </p>
              <input
                id="file-input"
                type="file"
                accept=".pdf,.docx,.pptx,.doc"
                style={{ display: 'none' }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Notes (Optional)</label>
            <textarea
              placeholder="Add any notes about this resubmission..."
              rows="3"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowResubmitModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit New Version
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default HistoryPage;
