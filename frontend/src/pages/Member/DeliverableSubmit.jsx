import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/Layout';
import './DeliverableSubmit.css';

export const DeliverableSubmitPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const deliverable = location.state?.deliverable || {};

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);

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
      
      // Mock submission - in real app, this would upload to backend
      const formData = new FormData();
      formData.append('deliverableId', id);
      formData.append('file', file);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSuccess('✅ File submitted successfully!');
      setFile(null);
      setFileName('');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/member/deliverables');
      }, 2000);
    } catch (err) {
      setError('Failed to submit file. Please try again.');
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
          <h1>{deliverable.title || 'Submit Deliverable'}</h1>
        </div>

        <div className="submit-container">
          <div className="submit-card">
            <div className="assignment-details">
              <div className="detail-section">
                <h3>Assignment Details</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Title:</label>
                    <p>{deliverable.title || 'N/A'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Deadline:</label>
                    <p>{deliverable.deadline || 'N/A'}</p>
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
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DeliverableSubmitPage;
