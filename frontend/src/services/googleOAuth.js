// Google OAuth Service - Redirect Flow

/**
 * Redirect user to backend OAuth login
 */
export const initiateGoogleLogin = () => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  window.location.href = `${backendUrl}/oauth2/authorization/google`;
};

/**
 * Parse tokens from OAuth callback URL
 * Expected URL format: /auth/callback?token=...&refreshToken=...&role=...
 */
export const parseAuthCallback = () => {
  const params = new URLSearchParams(window.location.search);
  
  const token = params.get('token');
  const refreshToken = params.get('refreshToken');
  const role = params.get('role');
  const error = params.get('error');
  const message = params.get('message');

  if (error) {
    throw new Error(message || 'Authentication failed');
  }

  if (!token || !refreshToken || !role) {
    throw new Error('Missing authentication data');
  }

  return { token, refreshToken, role };
};

/**
 * Store authentication tokens
 */
export const storeAuthTokens = (token, refreshToken, role) => {
  localStorage.setItem('accessToken', token);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('userRole', role);
};

/**
 * Get stored authentication tokens
 */
export const getAuthTokens = () => {
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    userRole: localStorage.getItem('userRole'),
  };
};

/**
 * Clear authentication tokens
 */
export const clearAuthTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userRole');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const { accessToken } = getAuthTokens();
  return !!accessToken;
};

/**
 * Get authorization header for API requests
 */
export const getAuthHeader = () => {
  const { accessToken } = getAuthTokens();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
};