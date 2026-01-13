import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/Layout';
import { submitFile, getLatestSubmission, downloadFile } from '../../services/submissionService';
import './DeliverableSubmit.css';

export const DeliverableSubmitPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const deliverable = location.state?.deliverable || {};

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState(null);

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const submission = await getLatestSubmission(id);
      setExistingSubmission(submission);
    } catch (err) {
      // No submission found, that's okay
      setExistingSubmission(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/member/deliverables');
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed',
    ];

    if (selectedFile.size > maxSize) {
      setError('File size exceeds 50MB limit');
      setFile(null);
      return;
    }

    if (!allowedTypes.includes(selectedFile.type)) {
      setError('File type not allowed. Allowed: PDF, DOC, DOCX, XLS, XLSX, TXT, ZIP, RAR');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setError('');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to submit');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Call real backend API
      const result = await submitFile(id, file);
      
      setSuccess('✅ File submitted successfully!');
      setFile(null);
      setFileName('');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/member/deliverables');
      }, 2000);
    } catch (err) {
      setError('Failed to submit file: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="deliverable-submit-page">
        <div className="submit-header">
          <button className="back-btn" onClick={handleGoBack}>
            ← Back to Deliverables
          </button>
          <h1>{deliverable.name || deliverable.title || 'Submit Deliverable'}</h1>
        </div>

        <div className="submit-container">
          <div className="submit-card">
            <div className="assignment-details">
              <div className="detail-section">
                <h3>Assignment Details</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Title:</label>
                    <p>{deliverable.name || deliverable.title || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Deadline:</label>
                    <p>{deliverable.dueDate || deliverable.deadline || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <p>
                      <span 
                        className={`status-label ${deliverable.status}`}
                      >
                        {deliverable.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="detail-description">
                  <label>Description:</label>
                  <p>{deliverable.description || 'No description provided'}</p>
                </div>
              </div>

              <hr className="divider" />

              {existingSubmission ? (
                <div className="detail-section">
                  <h3>✅ Submission Details</h3>
                  
                  <div className="submission-info">
                    <div className="info-row">
                      <label>File Name:</label>
                      <p>{existingSubmission.fileName}</p>
                    </div>
                    <div className="info-row">
                      <label>Submitted:</label>
                      <p>{new Date(existingSubmission.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="info-row">
                      <label>Status:</label>
                      <p>
                        <span className={`status-badge status-${existingSubmission.status.toLowerCase()}`}>
                          {existingSubmission.status}
                        </span>
                      </p>
                    </div>
                    <div className="info-row">
                      <label>Version:</label>
                      <p>v{existingSubmission.versionNumber}</p>
                    </div>
                    {existingSubmission.feedback && (
                      <div className="info-row">
                        <label>Feedback:</label>
                        <p>{existingSubmission.feedback}</p>
                      </div>
                    )}
                  </div>

                  <div className="submission-actions">
                    <button
                      className="download-btn"
                      onClick={() => downloadFile(existingSubmission.id, existingSubmission.fileName)}
                    >
                      📥 Download File
                    </button>
                    <button
                      className="resubmit-btn"
                      onClick={() => setExistingSubmission(null)}
                    >
                      📤 Submit New Version
                    </button>
                  </div>
                </div>
              ) : (
              <div className="detail-section">
                <h3>📤 Upload File</h3>
                
                {error && (
                  <div className="alert alert-error">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="alert alert-success">
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="upload-form">
                  <div
                    className={`drop-zone ${dragActive ? 'active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="file-input"
                      onChange={handleFileSelect}
                      disabled={loading}
                      className="file-input"
                    />
                    <label htmlFor="file-input" className="drop-zone-label">
                      <div className="drop-icon">📁</div>
                      <div className="drop-text">
                        <p className="drop-title">
                          {file ? `Selected: ${fileName}` : 'Drop file here or click to select'}
                        </p>
                        <p className="drop-subtitle">
                          Supported: PDF, DOC, DOCX, XLS, XLSX, TXT, ZIP, RAR (Max 50MB)
                        </p>
                      </div>
                    </label>
                  </div>

                  {file && (
                    <div className="file-preview">
                      <div className="file-info">
                        <span className="file-icon">📄</span>
                        <div className="file-details">
                          <p className="file-name">{fileName}</p>
                          <p className="file-size">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => {
                          setFile(null);
                          setFileName('');
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={!file || loading}
                  >
                    {loading ? '⏳ Submitting...' : '✓ Submit'}
                  </button>
                </form>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DeliverableSubmitPage;
