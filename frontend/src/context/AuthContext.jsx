import { createContext, useState, useContext, useEffect } from 'react';
import { 
  getAuthTokens, 
  storeAuthTokens, 
  clearAuthTokens, 
  isAuthenticated as checkAuth,
  getAuthHeader 
} from '../services/googleOAuth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user data from backend
  const fetchUserData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/user`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await response.json();
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // Clear invalid tokens
      clearAuthTokens();
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  // Initialize from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      if (checkAuth()) {
        try {
          await fetchUserData();
        } catch (error) {
          console.error('Auth initialization failed:', error);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login with tokens from OAuth callback
  const login = async (token, refreshToken, role) => {
    try {
      // Store tokens
      storeAuthTokens(token, refreshToken, role);
      
      // Fetch user data
      const userData = await fetchUserData();
      
      return { success: true, user: userData };
    } catch (error) {
      clearAuthTokens();
      throw new Error(error.message || 'Login failed');
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Call backend logout endpoint
      await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/logout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
        }
      );
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear tokens regardless of API call success
      clearAuthTokens();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      await fetchUserData();
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        loading, 
        login, 
        logout, 
        refreshUser,
        getAuthHeader 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};