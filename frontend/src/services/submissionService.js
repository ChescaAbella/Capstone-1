// Submission Management Service
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * Get authorization header with JWT token
 */
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

/**
 * Handle API response errors
 */
const handleResponse = async (response) => {
  if (response.status === 404) {
    // Return null for 404 instead of throwing
    return null;
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

/**
 * Submit a file for a deliverable
 * @param {number} deliverableId - Deliverable ID
 * @param {File} file - File to upload
 */
export const submitFile = async (deliverableId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `${API_URL}/api/v1/submissions/deliverable/${deliverableId}`,
    {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData
    }
  );
  return handleResponse(response);
};

/**
 * Get latest submission for a deliverable
 * @param {number} deliverableId - Deliverable ID
 */
export const getLatestSubmission = async (deliverableId) => {
  const response = await fetch(
    `${API_URL}/api/v1/submissions/deliverable/${deliverableId}/latest`,
    {
      headers: getAuthHeader()
    }
  );
  return handleResponse(response);
};

/**
 * Get submission history (all versions) for a deliverable
 * @param {number} deliverableId - Deliverable ID
 */
export const getSubmissionHistory = async (deliverableId) => {
  const response = await fetch(
    `${API_URL}/api/v1/submissions/deliverable/${deliverableId}/history`,
    {
      headers: getAuthHeader()
    }
  );
  return handleResponse(response);
};

/**
 * Get submission by ID
 * @param {number} submissionId - Submission ID
 */
export const getSubmissionById = async (submissionId) => {
  const response = await fetch(
    `${API_URL}/api/v1/submissions/${submissionId}`,
    {
      headers: getAuthHeader()
    }
  );
  return handleResponse(response);
};

/**
 * Review submission (update status/feedback)
 * @param {number} submissionId - Submission ID
 * @param {string} status - APPROVED, REJECTED, REVISION_NEEDED
 * @param {string} feedback - Feedback message
 */
export const reviewSubmission = async (submissionId, status, feedback) => {
  const response = await fetch(
    `${API_URL}/api/v1/submissions/${submissionId}/review?status=${status}&feedback=${feedback}`,
    {
      method: 'PUT',
      headers: getAuthHeader()
    }
  );
  return handleResponse(response);
};

/**
 * Get all submissions by current user
 */
export const getUserSubmissions = async () => {
  const response = await fetch(
    `${API_URL}/api/v1/submissions/user/my-submissions`,
    {
      headers: getAuthHeader()
    }
  );
  return handleResponse(response);
};

/**
 * Download file for a submission
 * @param {number} submissionId - Submission ID
 * @param {string} fileName - Original file name for download
 */
export const downloadFile = async (submissionId, fileName) => {
  const response = await fetch(
    `${API_URL}/api/v1/submissions/${submissionId}/download`,
    {
      headers: getAuthHeader()
    }
  );
  
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`);
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
