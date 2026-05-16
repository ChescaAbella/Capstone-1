import { useState, useEffect } from 'react';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Input } from '../../components/Input';
import { Alert } from '../../components/Alert';
import { useAuth } from '../../context/AuthContext';
import './Submissions.css';

const Submissions = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('list');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    submissionType: 'INDIVIDUAL',
    teamCode: '',
    allowLateSubmission: false,
    maxFileSizeMb: 50,
    allowedFileTypes: 'pdf,doc,docx,xlsx,xls,txt,zip,pptx',
    isPublished: false,
  });
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [studentSubmissions, setStudentSubmissions] = useState([]);
  const [showGradeForm, setShowGradeForm] = useState(null);
  const [gradeData, setGradeData] = useState({ grade: '', feedback: '' });

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/submissions/my-submissions`, {
        headers: {
          'X-User-Id': user.id,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch submissions');
      const data = await response.json();
      setSubmissions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentSubmissions = async (submissionId) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/submissions/${submissionId}/student-submissions`,
        {
          headers: {
            'X-User-Id': user.id,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch student submissions');
      const data = await response.json();
      setStudentSubmissions(data);
      setSelectedSubmission(data[0]?.submissionId);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleGradeInputChange = (e) => {
    const { name, value } = e.target;
    setGradeData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateOrUpdate = async () => {
    setError('');
    setSuccess('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.dueDate) {
      setError('Due date is required');
      return;
    }

    try {
      const dueDatetime = `${formData.dueDate}T${formData.dueTime || '23:59'}:00`;

      const payload = {
        ...formData,
        dueDate: dueDatetime,
      };

      let url = `${API_BASE}/api/submissions`;
      let method = 'POST';

      if (editingId) {
        url += `/${editingId}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save submission');
      }

      setSuccess(editingId ? 'Assignment updated successfully' : 'Assignment created successfully');
      resetForm();
      fetchSubmissions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePublish = async (submissionId) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/submissions/${submissionId}/publish`,
        {
          method: 'POST',
          headers: {
            'X-User-Id': user.id,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to publish assignment');
      setSuccess('Assignment published successfully');
      fetchSubmissions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (submissionId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/submissions/${submissionId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': user.id,
        },
      });

      if (!response.ok) throw new Error('Failed to delete assignment');
      setSuccess('Assignment deleted successfully');
      fetchSubmissions();
      setShowCreateForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmitGrade = async (studentSubmissionId) => {
    if (!gradeData.grade || gradeData.grade === '') {
      setError('Grade is required');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/submissions/student-submissions/${studentSubmissionId}/grade?grade=${gradeData.grade}&feedback=${encodeURIComponent(gradeData.feedback || '')}`,
        {
          method: 'POST',
          headers: {
            'X-User-Id': user.id,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to submit grade');
      setSuccess('Grade submitted successfully');
      setShowGradeForm(null);
      setGradeData({ grade: '', feedback: '' });
      if (selectedSubmission) {
        fetchStudentSubmissions(selectedSubmission);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      dueTime: '',
      submissionType: 'INDIVIDUAL',
      teamCode: '',
      allowLateSubmission: false,
      maxFileSizeMb: 50,
      allowedFileTypes: 'pdf,doc,docx,xlsx,xls,txt,zip,pptx',
      isPublished: false,
    });
    setEditingId(null);
    setShowCreateForm(false);
  };

  const handleEdit = (submission) => {
    const dueDateTime = new Date(submission.dueDate);
    setFormData({
      title: submission.title,
      description: submission.description || '',
      dueDate: dueDateTime.toISOString().split('T')[0],
      dueTime: dueDateTime.toTimeString().split(' ')[0].slice(0, 5),
      submissionType: submission.submissionType,
      teamCode: submission.teamCode || '',
      allowLateSubmission: submission.allowLateSubmission,
      maxFileSizeMb: submission.maxFileSizeMb,
      allowedFileTypes: submission.allowedFileTypes,
      isPublished: submission.isPublished,
    });
    setEditingId(submission.id);
    setShowCreateForm(true);
  };

  return (
    <div className="submissions-management">
      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}
      {success && (
        <Alert type="success" message={success} onClose={() => setSuccess('')} />
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="form-section">
          <div className="form-header">
            <h2>{editingId ? 'Edit Assignment' : 'Create New Assignment'}</h2>
            <button className="close-btn" onClick={resetForm}>✕</button>
          </div>

          <div className="form-grid">
            <Input
              label="Title *"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Project Proposal"
              required
            />

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Assignment details and requirements..."
                rows="4"
              />
            </div>

            <div className="date-time-row">
              <Input
                label="Due Date *"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Due Time"
                name="dueTime"
                type="time"
                value={formData.dueTime}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Submission Type</label>
              <select
                name="submissionType"
                value={formData.submissionType}
                onChange={handleInputChange}
              >
                <option value="INDIVIDUAL">Individual</option>
                <option value="TEAM">Team</option>
              </select>
            </div>

            <Input
              label="Team Code (leave empty for all teams)"
              name="teamCode"
              value={formData.teamCode}
              onChange={handleInputChange}
              placeholder="e.g., TEAM-A"
            />

            <Input
              label="Max File Size (MB)"
              name="maxFileSizeMb"
              type="number"
              value={formData.maxFileSizeMb}
              onChange={handleInputChange}
              min="1"
              max="500"
            />

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="allowLateSubmission"
                  checked={formData.allowLateSubmission}
                  onChange={handleInputChange}
                />
                Allow Late Submissions
              </label>
            </div>

            <div className="form-group">
              <label>Allowed File Types (comma-separated)</label>
              <input
                type="text"
                name="allowedFileTypes"
                value={formData.allowedFileTypes}
                onChange={handleInputChange}
                placeholder="pdf,doc,docx,xlsx,txt,zip"
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleInputChange}
                />
                Publish Now (visible to students)
              </label>
            </div>
          </div>

          <div className="form-actions">
            <Button
              onClick={handleCreateOrUpdate}
              variant="primary"
              text={editingId ? 'Update Assignment' : 'Create Assignment'}
            />
            <Button
              onClick={resetForm}
              variant="secondary"
              text="Cancel"
            />
          </div>
        </div>
      )}

      {/* Submissions List */}
      <div className="submissions-list-section">
        <div className="list-header">
          <h2>My Assignments ({submissions.length})</h2>
          {!showCreateForm && (
            <Button
              onClick={() => setShowCreateForm(true)}
              variant="primary"
              text="+ Create New"
            />
          )}
        </div>

        {loading ? (
          <div className="loading">Loading assignments...</div>
        ) : submissions.length === 0 ? (
          <div className="empty-state">
            <p>No assignments created yet</p>
            <Button
              onClick={() => setShowCreateForm(true)}
              variant="primary"
              text="Create Your First Assignment"
            />
          </div>
        ) : (
          <div className="submissions-grid">
            {submissions.map((submission) => (
              <div key={submission.id} className="submission-card">
                <div className="card-header">
                  <h3>{submission.title}</h3>
                  <div className="card-badges">
                    {submission.isPublished ? (
                      <span className="badge published">Published</span>
                    ) : (
                      <span className="badge draft">Draft</span>
                    )}
                    <span className="badge">{submission.submissionType}</span>
                  </div>
                </div>

                <div className="card-body">
                  <p className="description">{submission.description}</p>

                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Due:</span>
                      <span className="value">
                        {new Date(submission.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Team:</span>
                      <span className="value">
                        {submission.teamCode || 'All Teams'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Submitted:</span>
                      <span className="value">{submission.submittedCount}/{submission.totalStudents}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Graded:</span>
                      <span className="value">{submission.gradedCount}/{submission.totalStudents}</span>
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  {!submission.isPublished && (
                    <Button
                      size="small"
                      variant="success"
                      onClick={() => handlePublish(submission.id)}
                      text="Publish"
                    />
                  )}
                  {submission.isPublished && (
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => fetchStudentSubmissions(submission.id)}
                      text="View Submissions"
                    />
                  )}
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => handleEdit(submission)}
                    text="Edit"
                  />
                  <Button
                    size="small"
                    variant="danger"
                    onClick={() => handleDelete(submission.id)}
                    text="Delete"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student Submissions */}
      {studentSubmissions.length > 0 && (
        <div className="student-submissions-section">
          <div className="section-header">
            <h2>Student Submissions for: {studentSubmissions[0]?.submissionTitle}</h2>
          </div>

          <div className="student-submissions-table">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Team</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Grade</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {studentSubmissions.map((ss) => (
                  <tr key={ss.id}>
                    <td>{ss.studentName}</td>
                    <td>{ss.studentEmail}</td>
                    <td>{ss.teamCode}</td>
                    <td>
                      <span className={`status-badge ${ss.submissionStatus.toLowerCase()}`}>
                        {ss.submissionStatus}
                      </span>
                    </td>
                    <td>
                      {ss.submittedAt
                        ? new Date(ss.submittedAt).toLocaleDateString()
                        : '-'}
                    </td>
                    <td>
                      {ss.grade !== null ? (
                        <span className="grade">{ss.grade}%</span>
                      ) : (
                        <span className="no-grade">-</span>
                      )}
                    </td>
                    <td>
                      {ss.submissionStatus === 'SUBMITTED' && (
                        <Button
                          size="small"
                          onClick={() => {
                            setShowGradeForm(ss.id);
                            setGradeData({ grade: '', feedback: ss.feedback || '' });
                          }}
                          text="Grade"
                        />
                      )}
                      {showGradeForm === ss.id && (
                        <div className="grade-form-inline">
                          <input
                            type="number"
                            placeholder="Grade (0-100)"
                            min="0"
                            max="100"
                            name="grade"
                            value={gradeData.grade}
                            onChange={handleGradeInputChange}
                          />
                          <textarea
                            placeholder="Feedback..."
                            name="feedback"
                            value={gradeData.feedback}
                            onChange={handleGradeInputChange}
                            rows="2"
                          />
                          <Button
                            size="small"
                            variant="success"
                            onClick={() => handleSubmitGrade(ss.id)}
                            text="Save"
                          />
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() => setShowGradeForm(null)}
                            text="Cancel"
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Submissions;
