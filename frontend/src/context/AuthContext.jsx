import { createContext, useState, useContext, useEffect } from 'react';
import { mockUser, mockManagerUser, mockAdminUser } from '../services/mockApi';
import { verifyGoogleToken } from '../services/googleOAuth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('authToken');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
        if (savedToken) {
          setToken(savedToken);
        }
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
    setLoading(false);
  }, []);

  const login = (emailOrToken, password, userData = null) => {
    // Support both traditional login and OAuth
    let user;
    
    if (userData) {
      // OAuth login or direct user object
      user = userData;
    } else {
      // Traditional login - select user based on email
      if (emailOrToken.includes('professor') || emailOrToken.includes('manager')) {
        user = mockManagerUser;
      } else if (emailOrToken.includes('admin')) {
        user = mockAdminUser;
      } else {
        user = mockUser;
      }
    }
    
    setUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(user));
    if (emailOrToken && typeof emailOrToken === 'string' && !password) {
      // It's a token from OAuth
      setToken(emailOrToken);
      localStorage.setItem('authToken', emailOrToken);
    }
  };

  const loginWithGoogle = async (googleToken) => {
    try {
      const result = await verifyGoogleToken(googleToken);
      const { user, token } = result;
      
      setUser(user);
      setIsAuthenticated(true);
      setToken(token);
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('authToken', token);
      
      return { success: true, user };
    } catch (error) {
      throw new Error(error.message || 'Google login failed');
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  };

  // For testing: set a specific mock user
  const setMockUser = (userType) => {
    let userData;
    if (userType === 'manager') {
      userData = mockManagerUser;
    } else if (userType === 'admin') {
      userData = mockAdminUser;
    } else {
      userData = mockUser;
    }
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, token, login, logout, setMockUser, loginWithGoogle }}>
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
