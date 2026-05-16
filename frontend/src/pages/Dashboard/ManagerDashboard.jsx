import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { Card, CardBody } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Table } from '../../components/Table';
import { Modal } from '../../components/Modal';
import { Input, Textarea, Select } from '../../components/Input';
import { Alert } from '../../components/Alert';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  
  // Overview state
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: 'Project Kickoff',
      course: 'Website Redesign',
      dueDate: '2025-01-15',
      submissions: '28/30',
      status: 'closed',
    },
    {
      id: 2,
      title: 'Phase 2 Deliverables',
      course: 'Mobile App Dev',
      dueDate: '2025-01-20',
      submissions: '25/30',
      status: 'active',
    },
    {
      id: 3,
      title: 'Design Review',
      course: 'UI/UX Project',
      dueDate: '2025-01-25',
      submissions: '22/30',
      status: 'active',
    },
  ]);

  const students = [
    { id: 1, name: 'John Doe', email: 'john@example.com', submissions: 25, avgGrade: 'Excellent' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', submissions: 28, avgGrade: 'Outstanding' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', submissions: 20, avgGrade: 'Good' },
  ];

  // Submissions management state
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
    if (activeTab === 'submissions') {
      fetchSubmissions();
    }
  }, [activeTab]);

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

      setSuccess(editingId ? 'Submission updated successfully' : 'Submission created successfully');
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

      if (!response.ok) throw new Error('Failed to publish submission');
      setSuccess('Submission published successfully');
      fetchSubmissions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (submissionId) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/submissions/${submissionId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Id': user.id,
        },
      });

      if (!response.ok) throw new Error('Failed to delete submission');
      setSuccess('Submission deleted successfully');
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

  const assignmentColumns = [
    { key: 'title', label: 'Deliverable', width: '30%' },
    { key: 'course', label: 'Project', width: '15%' },
    { key: 'dueDate', label: 'Due Date', width: '15%' },
    { key: 'submissions', label: 'Submissions', width: '15%' },
    {
      key: 'status',
      label: 'Status',
      width: '15%',
      render: (status) => (
        <Badge variant={status === 'active' ? 'success' : 'info'}>
          {status}
        </Badge>
      ),
    },
  ];

  const studentColumns = [
    { key: 'name', label: 'Name', width: '25%' },
    { key: 'email', label: 'Email', width: '35%' },
    { key: 'submissions', label: 'Submissions', width: '20%' },
    { key: 'avgGrade', label: 'Avg Grade', width: '20%' },
  ];

  return (
    <DashboardLayout role="MANAGER">
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'submissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('submissions')}
        >
          📋 Submissions Management
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="welcome-section">
            <h1>Welcome, {user?.name?.split(' ')[0]}! 👋</h1>
            <p>Manage your projects and track team progress</p>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <Card>
              <CardBody className="stat-card">
                <div className="stat-value">3</div>
                <div className="stat-label">Active Projects</div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="stat-card">
                <div className="stat-value">75/90</div>
                <div className="stat-label">Total Submissions</div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="stat-card">
                <div className="stat-value">30</div>
                <div className="stat-label">Team Members</div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="stat-card">
                <div className="stat-value">83%</div>
                <div className="stat-label">Completion Rate</div>
              </CardBody>
            </Card>
          </div>

          {/* Create Assignment Button */}
          <div className="action-bar">
            <Button
              variant="primary"
              onClick={() => setShowCreateAssignment(true)}
            >
              + Create New Assignment
            </Button>
          </div>

          {/* Assignments */}
          <div className="dashboard-section">
            <h2>📋 Projects</h2>
            <Table columns={assignmentColumns} data={assignments} />
          </div>

          {/* Students Overview */}
          <div className="dashboard-section">
            <h2>👥 Team Overview</h2>
            <Table columns={studentColumns} data={students} />
          </div>

          {/* Create Assignment Modal */}
          <Modal
            isOpen={showCreateAssignment}
            title="Create New Project"
            onClose={() => setShowCreateAssignment(false)}
            size="md"
          >
            <form className="assignment-form">
              <Input label="Assignment Title" placeholder="e.g., Web Development Project" fullWidth />
              <Select
                label="Course"
                options={[
                  { value: 'ai101', label: 'AI 101' },
                  { value: 'cs201', label: 'CS 201' },
                  { value: 'web101', label: 'WEB 101' },
                ]}
                fullWidth
              />
              <Input label="Due Date" type="date" fullWidth />
              <Textarea label="Description" placeholder="Describe the assignment..." fullWidth />
              <div className="modal-actions">
                <Button variant="primary" fullWidth>
                  Create Assignment
                </Button>
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => setShowCreateAssignment(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Modal>
        </>
      )}

      {activeTab === 'submissions' && (
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
                <h2>{editingId ? 'Edit Submission' : 'Create New Submission'}</h2>
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
                  text={editingId ? 'Update Submission' : 'Create Submission'}
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
              <h2>My Submissions ({submissions.length})</h2>
              {!showCreateForm && (
                <Button
                  onClick={() => setShowCreateForm(true)}
                  variant="primary"
                  text="+ Create New"
                />
              )}
            </div>

            {loading ? (
              <div className="loading">Loading submissions...</div>
            ) : submissions.length === 0 ? (
              <div className="empty-state">
                <p>No submissions created yet</p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  variant="primary"
                  text="Create Your First Submission"
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
      )}
    </DashboardLayout>
  );
};

export default ManagerDashboard;
