import { createContext, useState, useContext, useEffect } from 'react';
import { 
  getAuthTokens, 
  storeAuthTokens, 
  clearAuthTokens, 
  isAuthenticated as checkAuth,
  getAuthHeader,
  signupWithEmail,
  loginWithEmail
} from '../services/authService';

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
      
      // Don't initialize if we're on the OAuth callback page
      if (window.location.pathname === '/auth/callback') {
        console.log('ℹ️ Skipping initialization - on OAuth callback page');
        setLoading(false);
        return;
      }
      
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
  const loginWithOAuth = async (token, refreshToken, role) => {
    try {
      console.log('🔄 OAuth login started');
      console.log('🔍 Token length:', token?.length);
      console.log('🔍 RefreshToken:', refreshToken?.substring(0, 20) + '...');
      console.log('🔍 Role:', role);
      
      // Store tokens
      storeAuthTokens(token, refreshToken, role);
      console.log('✅ Tokens stored in localStorage');
      
      // Fetch user data
      const userData = await fetchUserData();
      console.log('✅ OAuth login successful');
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ OAuth login failed:', error);
      clearAuthTokens();
      throw new Error(error.message || 'Login failed');
    }
  };

  // Signup with email/password
  const signup = async (signupData) => {
    try {
      console.log('🔄 Signup started');
      const data = await signupWithEmail(signupData);
      console.log('✅ Signup successful, fetching user data...');
      
      // Fetch user data after signup
      const userData = await fetchUserData();
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ Signup failed:', error);
      clearAuthTokens();
      throw error;
    }
  };

  // Login with email/password
  const login = async (loginData) => {
    try {
      console.log('🔄 Email login started');
      const data = await loginWithEmail(loginData);
      console.log('✅ Email login successful, fetching user data...');
      
      // Fetch user data after login
      const userData = await fetchUserData();
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ Email login failed:', error);
      clearAuthTokens();
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      console.log('🔄 Logging out...');
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
      clearAuthTokens();
      setUser(null);
      setIsAuthenticated(false);
      console.log('✅ Logged out');
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
        login,           // Email/password login
        signup,          // Email/password signup
        loginWithOAuth,  // OAuth login (for callback)
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