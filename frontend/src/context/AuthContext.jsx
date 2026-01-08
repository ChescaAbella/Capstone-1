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
      const authHeader = getAuthHeader();
      console.log('🔍 Auth header:', authHeader);
      console.log('🔍 Tokens from localStorage:', getAuthTokens());
      
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/user`;
      console.log('🔍 Fetching from:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
      });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error('Failed to fetch user data');
      }

      const userData = await response.json();
      console.log('✅ User data received:', userData);
      
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      console.error('❌ Failed to fetch user data:', error);
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
      console.log('🔄 Initializing auth...');
      if (checkAuth()) {
        console.log('✅ Token found in localStorage, fetching user data...');
        try {
          await fetchUserData();
        } catch (error) {
          console.error('❌ Auth initialization failed:', error);
        }
      } else {
        console.log('ℹ️ No token found in localStorage');
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login with tokens from OAuth callback
  const login = async (token, refreshToken, role) => {
    try {
      console.log('🔄 Login started');
      console.log('🔍 Token length:', token?.length);
      console.log('🔍 RefreshToken:', refreshToken?.substring(0, 20) + '...');
      console.log('🔍 Role:', role);
      
      // Store tokens
      storeAuthTokens(token, refreshToken, role);
      console.log('✅ Tokens stored in localStorage');
      
      // Fetch user data
      const userData = await fetchUserData();
      console.log('✅ Login successful');
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ Login failed:', error);
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