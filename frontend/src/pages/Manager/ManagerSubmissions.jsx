import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../Dashboard/DashboardLayout';
import { getSubmissionHistory, reviewSubmission, downloadFile } from '../../services/submissionService';
import './ManagerSubmissions.css';

export const ManagerSubmissionsPage = () => {
  const { deliverableId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [reviewStatus, setReviewStatus] = useState('APPROVED');

  useEffect(() => {
    fetchSubmissions();
  }, [deliverableId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await getSubmissionHistory(deliverableId);
      setSubmissions(data);
      if (data.length > 0) {
        setSelectedSubmission(data[0]);
      }
    } catch (err) {
      setError('Failed to load submissions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      await reviewSubmission(selectedSubmission.id, reviewStatus, feedback);
      setSuccess('✅ Review submitted successfully!');
      setFeedback('');
      fetchSubmissions();
    } catch (err) {
      setError('Failed to submit review: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'SUBMITTED': '#ffc107',
      'APPROVED': '#28a745',
      'REJECTED': '#dc3545',
      'REVISION_NEEDED': '#fd7e14'
    };
    return colors[status] || '#6c757d';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="manager-submissions-page">
          <div className="loading">Loading submissions...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (submissions.length === 0) {
    return (
      <DashboardLayout>
        <div className="manager-submissions-page">
          <button className="back-btn" onClick={() => navigate('/manager/deliverables')}>
            ← Back to Deliverables
          </button>
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No Submissions Yet</h3>
            <p>No submissions have been made for this deliverable.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="manager-submissions-page">
        <button className="back-btn" onClick={() => navigate('/manager/deliverables')}>
          ← Back to Deliverables
        </button>
        
        <h1>📋 Review Submissions</h1>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="submissions-container">
          {/* Submission List */}
          <div className="submissions-list">
            <h3>Submissions ({submissions.length})</h3>
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className={`submission-item ${selectedSubmission?.id === submission.id ? 'active' : ''}`}
                onClick={() => setSelectedSubmission(submission)}
              >
                <div className="submission-header">
                  <span className="version">v{submission.versionNumber}</span>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(submission.status) }}
                  >
                    {submission.status}
                  </span>
                </div>
                <div className="submission-info">
                  <p className="file-name">{submission.fileName}</p>
                  <p className="submitted-by">By: {submission.submittedBy}</p>
                  <p className="submitted-at">
                    {new Date(submission.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Submission Details */}
          {selectedSubmission && (
            <div className="submission-details">
              <div className="details-header">
                <h3>Submission Details</h3>
                <span
                  className="status-badge-large"
                  style={{ backgroundColor: getStatusColor(selectedSubmission.status) }}
                >
                  {selectedSubmission.status}
                </span>
              </div>

              <div className="details-content">
                <div className="detail-row">
                  <label>File Name:</label>
                  <p>{selectedSubmission.fileName}</p>
                </div>
                <div className="detail-row">
                  <label>File Size:</label>
                  <p>{(selectedSubmission.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div className="detail-row">
                  <label>File Type:</label>
                  <p>{selectedSubmission.fileType}</p>
                </div>
                <div className="detail-row">
                  <label>Submitted By:</label>
                  <p>{selectedSubmission.submittedBy}</p>
                </div>
                <div className="detail-row">
                  <label>Submitted At:</label>
                  <p>{new Date(selectedSubmission.createdAt).toLocaleString()}</p>
                </div>
                <div className="detail-row">
                  <label>Version:</label>
                  <p>v{selectedSubmission.versionNumber}</p>
                </div>
                {selectedSubmission.feedback && (
                  <div className="detail-row">
                    <label>Previous Feedback:</label>
                    <p className="feedback">{selectedSubmission.feedback}</p>
                  </div>
                )}
                
                <button
                  type="button"
                  className="download-file-btn"
                  onClick={() => downloadFile(selectedSubmission.id, selectedSubmission.fileName)}
                >
                  📥 Download File
                </button>
              </div>

              {/* Review Form */}
              <form onSubmit={handleReview} className="review-form">
                <h4>Submit Review</h4>
                
                <div className="form-group">
                  <label>Status:</label>
                  <select
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value)}
                    className="form-select"
                  >
                    <option value="APPROVED">✅ Approve</option>
                    <option value="REJECTED">❌ Reject</option>
                    <option value="REVISION_NEEDED">🔄 Request Revision</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Feedback:</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide feedback to the student..."
                    rows={4}
                    className="form-textarea"
                  />
                </div>

                <button type="submit" className="submit-review-btn">
                  📤 Submit Review
                </button>
              </form>

              <div className="file-note">
                <p><strong>Note:</strong> To download and view the file, check the backend uploads folder at: <code>backend/uploads/submissions/{deliverableId}/</code></p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerSubmissionsPage;
