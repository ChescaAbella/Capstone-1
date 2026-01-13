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
