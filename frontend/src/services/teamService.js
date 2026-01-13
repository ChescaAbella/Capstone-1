// Team Management Service
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

// ==================== TEAM CRUD ====================

/**
 * Create a new team
 * @param {Object} teamData - { name, description }
 */
export const createTeam = async (teamData) => {
  const response = await fetch(`${API_URL}/api/v1/teams`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(teamData)
  });
  return handleResponse(response);
};

/**
 * Get all teams
 */
export const getAllTeams = async () => {
  const response = await fetch(`${API_URL}/api/v1/teams`, {
    headers: getAuthHeader()
  });
  return handleResponse(response);
};

/**
 * Get active teams only
 */
export const getActiveTeams = async () => {
  const response = await fetch(`${API_URL}/api/v1/teams/active`, {
    headers: getAuthHeader()
  });
  return handleResponse(response);
};

/**
 * Get team by ID
 * @param {number} id - Team ID
 */
export const getTeamById = async (id) => {
  const response = await fetch(`${API_URL}/api/v1/teams/${id}`, {
    headers: getAuthHeader()
  });
  return handleResponse(response);
};

/**
 * Update team
 * @param {number} id - Team ID
 * @param {Object} teamData - { name, description }
 */
export const updateTeam = async (id, teamData) => {
  const response = await fetch(`${API_URL}/api/v1/teams/${id}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(teamData)
  });
  return handleResponse(response);
};

/**
 * Archive team
 * @param {number} id - Team ID
 */
export const archiveTeam = async (id) => {
  const response = await fetch(`${API_URL}/api/v1/teams/${id}/archive`, {
    method: 'PUT',
    headers: getAuthHeader()
  });
  return handleResponse(response);
};

/**
 * Search teams by keyword
 * @param {string} keyword - Search keyword
 */
export const searchTeams = async (keyword) => {
  const response = await fetch(`${API_URL}/api/v1/teams/search?keyword=${encodeURIComponent(keyword)}`, {
    headers: getAuthHeader()
  });
  return handleResponse(response);
};

/**
 * Delete team
 * @param {number} id - Team ID
 */
export const deleteTeam = async (id) => {
  const response = await fetch(`${API_URL}/api/v1/teams/${id}`, {
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
 * Get team status badge color
 */
export const getTeamStatusColor = (isActive) => {
  return isActive ? '#28a745' : '#6c757d';
};

/**
 * Format team data for display
 */
export const formatTeamForDisplay = (team) => {
  return {
    ...team,
    createdAtFormatted: new Date(team.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    statusLabel: team.isActive ? 'Active' : 'Archived',
    memberCount: team.projects?.length || 0
  };
};
