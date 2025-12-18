import { createContext, useState, useContext, useEffect } from 'react';
import { mockUser, mockManagerUser, mockAdminUser } from '../services/mockApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Mock login - select user based on email
    let userData;
    if (email.includes('professor') || email.includes('manager')) {
      userData = mockManagerUser;
    } else if (email.includes('admin')) {
      userData = mockAdminUser;
    } else {
      userData = mockUser;
    }
    
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
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
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, setMockUser }}>
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
