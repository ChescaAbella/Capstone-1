// Deliverable Management Service
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * Get authorization header with JWT token
 */
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
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

// ==================== DELIVERABLE CRUD ====================

/**
 * Create a new deliverable
 * @param {Object} deliverableData - { title, description, deadline, projectId, teamId, assignedTo }
 */
export const createDeliverable = async (deliverableData) => {
  const response = await fetch(`${API_URL}/api/v1/deliverables`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(deliverableData)
  });
  return handleResponse(response);
};

/**
 * Get deliverable by ID
 * @param {number} id - Deliverable ID
 */
export const getDeliverableById = async (id) => {
  const response = await fetch(`${API_URL}/api/v1/deliverables/${id}`, {
    headers: getAuthHeader()
  });
  return handleResponse(response);
};

/**
 * Get all deliverables for a project (timeline view)
 * @param {number} projectId - Project ID
 */
export const getDeliverablesByProject = async (projectId) => {
  const response = await fetch(`${API_URL}/api/v1/deliverables/project/${projectId}`, {
    headers: getAuthHeader()
  });
  return handleResponse(response);
};

/**
 * Get all deliverables for a team
 * @param {number} teamId - Team ID
 */
export const getDeliverablesByTeam = async (teamId) => {
  const response = await fetch(`${API_URL}/api/v1/deliverables/team/${teamId}`, {
    headers: getAuthHeader()
  });
  return handleResponse(response);
};

/**
 * Get active deliverables for a team
 * @param {number} teamId - Team ID
 */
export const getActiveDeliverablesByTeam = async (teamId) => {
  const response = await fetch(`${API_URL}/api/v1/deliverables/team/${teamId}/active`, {
    headers: getAuthHeader()
  });
  return handleResponse(response);
};

/**
 * Update deliverable progress
 * @param {number} id - Deliverable ID
 * @param {Object} progressData - { progress, notes }
 */
export const updateDeliverableProgress = async (id, progressData) => {
  const response = await fetch(`${API_URL}/api/v1/deliverables/${id}/progress`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(progressData)
  });
  return handleResponse(response);
};

/**
 * Delete deliverable
 * @param {number} id - Deliverable ID
 */
export const deleteDeliverable = async (id) => {
  const response = await fetch(`${API_URL}/api/v1/deliverables/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  
  if (response.status === 204) {
    return { success: true };
  }
  return handleResponse(response);
};

// ==================== DEADLINE TRACKING ====================

/**
 * Get overdue deliverables
 */
export const getOverdueDeliverables = async () => {
  const response = await fetch(`${API_URL}/api/v1/deliverables/overdue`, {
    headers: getAuthHeader()
  });
  return handleResponse(response);
};

/**
 * Get at-risk deliverables (progress < 30% with approaching deadline)
 */
export const getAtRiskDeliverables = async () => {
  const response = await fetch(`${API_URL}/api/v1/deliverables/at-risk`, {
    headers: getAuthHeader()
  });
  return handleResponse(response);
};

/**
 * Get upcoming deliverables
 * @param {number} days - Number of days to look ahead (default: 7)
 */
export const getUpcomingDeliverables = async (days = 7) => {
  const response = await fetch(`${API_URL}/api/v1/deliverables/upcoming?days=${days}`, {
    headers: getAuthHeader()
  });
  return handleResponse(response);
};

// ==================== GANTT CHART ====================

/**
 * Get Gantt chart data for a project
 * @param {number} projectId - Project ID
 */
export const getGanttChartData = async (projectId) => {
  const response = await fetch(`${API_URL}/api/v1/deliverables/gantt/project/${projectId}`, {
    headers: getAuthHeader()
  });
  return handleResponse(response);
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Calculate days remaining until deadline
 * @param {string} deadline - ISO date string
 */
export const calculateDaysRemaining = (deadline) => {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Get status based on progress and deadline
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} deadline - ISO date string
 */
export const getDeliverableStatus = (progress, deadline) => {
  if (progress === 100) return 'completed';
  
  const daysRemaining = calculateDaysRemaining(deadline);
  if (daysRemaining < 0) return 'overdue';
  if (progress < 30 && daysRemaining <= 7) return 'at-risk';
  
  return 'in-progress';
};

/**
 * Format deadline for display
 * @param {string} deadline - ISO date string
 */
export const formatDeadline = (deadline) => {
  const date = new Date(deadline);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
