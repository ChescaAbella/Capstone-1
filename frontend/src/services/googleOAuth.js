// Google OAuth Service
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

/**
 * Handle Google OAuth callback and verify token
 * @param {string} token - Google ID token from oauth library
 * @returns {Promise} - Backend verification result
 */
export const verifyGoogleToken = async (token) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/google`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Google authentication failed');
    }

    const data = await response.json();
    return data; // Should contain { user, token }
  } catch (error) {
    throw new Error(error.message || 'Failed to verify Google token');
  }
};

/**
 * Decode Google JWT token (client-side, for getting user info)
 * Note: This is for display purposes; always verify on backend
 */
export const decodeGoogleToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};
