// src/services/authService.js
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// ===== TOKEN MANAGEMENT =====
export const getAuthTokens = () => {
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    role: localStorage.getItem('userRole'),
  };
};

export const storeAuthTokens = (accessToken, refreshToken, role) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('userRole', role);
};

export const clearAuthTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userInfo');
};

export const isAuthenticated = () => {
  const { accessToken } = getAuthTokens();
  return !!accessToken;
};

export const getAuthHeader = () => {
  const { accessToken } = getAuthTokens();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
};

// ===== GOOGLE OAUTH =====
export const initiateGoogleLogin = () => {
  window.location.href = `${API_URL}/oauth2/authorization/google`;
};

// ===== EMAIL/PASSWORD AUTH =====

/**
 * Sign up with email and password
 * @param {Object} signupData - { name, email, password, role }
 * @returns {Promise<Object>} - { accessToken, refreshToken, role, userInfo }
 */
export const signupWithEmail = async (signupData) => {
  try {
    console.log('📤 Sending signup request...');
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData),
    });

    console.log('📥 Signup response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Signup failed');
    }

    const data = await response.json();
    console.log('✅ Signup successful, data received');
    
    // Store tokens immediately
    storeAuthTokens(data.accessToken, data.refreshToken, data.role);
    console.log('💾 Tokens stored in localStorage');
    
    return data;
  } catch (error) {
    console.error('❌ Signup error:', error);
    throw error;
  }
};

/**
 * Login with email and password
 * @param {Object} loginData - { email, password }
 * @returns {Promise<Object>} - { accessToken, refreshToken, role, userInfo }
 */
export const loginWithEmail = async (loginData) => {
  try {
    console.log('📤 Sending login request...');
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    console.log('📥 Login response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    console.log('✅ Login successful, data received');
    
    // Store tokens immediately
    storeAuthTokens(data.accessToken, data.refreshToken, data.role);
    console.log('💾 Tokens stored in localStorage');
    
    return data;
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
};

// ===== TOKEN REFRESH =====
export const refreshAccessToken = async () => {
  try {
    const { refreshToken } = getAuthTokens();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    storeAuthTokens(data.accessToken, data.refreshToken, data.role);
    
    return data;
  } catch (error) {
    console.error('Token refresh error:', error);
    clearAuthTokens();
    throw error;
  }
};

// ===== LOGOUT =====
export const logout = async () => {
  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearAuthTokens();
  }
};

// ===== OAUTH CALLBACK PARSER =====
/**
 * Parse OAuth callback URL parameters
 * @returns {Object} - { token, refreshToken, role, error }
 */
export const parseAuthCallback = () => {
  const params = new URLSearchParams(window.location.search);
  
  return {
    token: params.get('token'),
    refreshToken: params.get('refreshToken'),
    role: params.get('role'),
    error: params.get('error'),
    message: params.get('message'),
  };
};