import { useState, useRef } from 'react';
import { Button } from './Button';
import { Alert } from './Alert';
import './StudentImportUpload.css';

export const StudentImportUpload = ({ userId, apiBaseUrl }) => {
  const [files, setFiles] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [importedStudents, setImportedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      setFiles(droppedFiles[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFiles(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!files) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', files);

      const response = await fetch(
        `${apiBaseUrl || 'http://localhost:8080'}/api/admin/student-imports/upload`,
        {
          method: 'POST',
          headers: {
            'X-User-Id': userId,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload file');
      }

      const data = await response.json();
      setUploadResult(data);
      setSuccess(
        `Successfully imported ${data.successCount} students. ${
          data.errorCount > 0 ? `${data.errorCount} errors found.` : ''
        }`
      );
      setFiles(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Fetch updated imported students list
      fetchImportedStudents();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const fetchImportedStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${apiBaseUrl || 'http://localhost:8080'}/api/admin/student-imports`,
        {
          headers: {
            'X-User-Id': userId,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch imported students');
      }

      const data = await response.json();
      setImportedStudents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBatch = async (batchId) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) {
      return;
    }

    try {
      const response = await fetch(
        `${apiBaseUrl || 'http://localhost:8080'}/api/admin/student-imports/batch/${batchId}`,
        {
          method: 'DELETE',
          headers: {
            'X-User-Id': userId,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete batch');
      }

      setSuccess('Batch deleted successfully');
      fetchImportedStudents();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteStudent = async (studentImportId) => {
    if (!window.confirm('Are you sure you want to remove this student?')) {
      return;
    }

    try {
      const response = await fetch(
        `${apiBaseUrl || 'http://localhost:8080'}/api/admin/student-imports/${studentImportId}`,
        {
          method: 'DELETE',
          headers: {
            'X-User-Id': userId,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete student');
      }

      setSuccess('Student removed successfully');
      fetchImportedStudents();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="student-import-upload">
      <div className="upload-section">
        <h3>Upload Student Data</h3>
        
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="file-drop-zone" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
          <div className="drop-icon">📁</div>
          <p>Drag and drop your Excel file here</p>
          <p className="or-text">or</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="file-input"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="secondary"
            text="Choose File"
          />
        </div>

        {files && (
          <div className="file-selected">
            <span>📄 {files.name}</span>
            <Button
              onClick={() => {
                setFiles(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              variant="danger"
              text="Remove"
            />
          </div>
        )}

        <div className="upload-instructions">
          <h4>Excel Format Requirements:</h4>
          <ul>
            <li><strong>Required columns:</strong> Email, Team Code</li>
            <li><strong>Optional columns:</strong> Student Name, Student ID</li>
            <li>First row should contain column headers</li>
            <li>Supported formats: .xlsx, .xls</li>
          </ul>
        </div>

        <Button
          onClick={handleUpload}
          disabled={!files || uploading}
          text={uploading ? 'Uploading...' : 'Upload Students'}
        />
      </div>

      {uploadResult && (
        <div className="upload-result">
          <h3>Upload Summary</h3>
          <div className="result-stats">
            <div className="stat success">
              <span className="stat-label">Successfully Imported</span>
              <span className="stat-value">{uploadResult.successCount}</span>
            </div>
            {uploadResult.errorCount > 0 && (
              <div className="stat error">
                <span className="stat-label">Errors</span>
                <span className="stat-value">{uploadResult.errorCount}</span>
              </div>
            )}
          </div>

          {uploadResult.errors && uploadResult.errors.length > 0 && (
            <div className="errors-list">
              <h4>Errors Found:</h4>
              <ul>
                {uploadResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="imported-students-section">
        <div className="section-header">
          <h3>Imported Students</h3>
          <Button
            onClick={fetchImportedStudents}
            variant="secondary"
            text={loading ? 'Loading...' : 'Refresh'}
            disabled={loading}
          />
        </div>

        {loading && <p>Loading...</p>}

        {!loading && importedStudents.length === 0 ? (
          <p className="no-data">No students imported yet</p>
        ) : (
          <div className="students-table-wrapper">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Team Code</th>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {importedStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.email}</td>
                    <td>{student.teamCode}</td>
                    <td>{student.studentName || '-'}</td>
                    <td>{student.studentId || '-'}</td>
                    <td>
                      <span className={`status ${student.isRegistered ? 'registered' : 'pending'}`}>
                        {student.isRegistered ? 'Registered' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteStudent(student.id)}
                        title="Remove student"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
