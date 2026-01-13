// Project Management Service
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// ==================== PROJECT CRUD ====================

/**
 * Create a new project (automatically creates Google Sheet)
 * @param {Object} projectData - { name, description, deadline, teamId, googleSheetId }
 */
export const createProject = async (projectData) => {
  const response = await fetch(`${API_URL}/api/v1/projects`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(projectData)
  });
  return handleResponse(response);
};

/**
 * Get all projects
 */
export const getAllProjects = async () => {
  const response = await fetch(`${API_URL}/api/v1/projects`, {
    headers: getAuthHeader()
  });
  return handleResponse(response);
};

/**
 * Get project by ID
 * @param {number} id - Project ID
 */
export const getProjectById = async (id) => {
  const response = await fetch(`${API_URL}/api/v1/projects/${id}`, {
    headers: getAuthHeader()
  });
  return handleResponse(response);
};

/**
 * Get projects by team
 * @param {number} teamId - Team ID
 */
export const getProjectsByTeam = async (teamId) => {
  const response = await fetch(`${API_URL}/api/v1/projects/team/${teamId}`, {
    headers: getAuthHeader()
  });
  return handleResponse(response);
};

/**
 * Get projects by status
 * @param {string} status - ACTIVE, COMPLETED, ARCHIVED
 */
export const getProjectsByStatus = async (status) => {
  const response = await fetch(`${API_URL}/api/v1/projects/status/${status}`, {
    headers: getAuthHeader()
  });
  return handleResponse(response);
};

/**
 * Update project status
 * @param {number} id - Project ID
 * @param {string} status - ACTIVE, COMPLETED, ARCHIVED
 */
export const updateProjectStatus = async (id, status) => {
  const response = await fetch(`${API_URL}/api/v1/projects/${id}/status?status=${status}`, {
    method: 'PUT',
    headers: getAuthHeader()
  });
  return handleResponse(response);
};

/**
 * Delete project
 * @param {number} id - Project ID
 */
export const deleteProject = async (id) => {
  const response = await fetch(`${API_URL}/api/v1/projects/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  
  if (response.status === 204) {
    return { success: true };
  }
  return handleResponse(response);
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get project status badge color
 */
export const getProjectStatusColor = (status) => {
  const colors = {
    'ACTIVE': '#28a745',
    'COMPLETED': '#007bff',
    'ARCHIVED': '#6c757d'
  };
  return colors[status] || '#6c757d';
};

/**
 * Format project data for display
 */
export const formatProjectForDisplay = (project) => {
  return {
    ...project,
    deadlineFormatted: new Date(project.deadline).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    createdAtFormatted: new Date(project.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  };
};
