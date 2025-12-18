// Mock API service for testing frontend without backend
export const mockUser = {
  id: 1,
  email: 'student@school.edu',
  name: 'John Student',
  role: 'MEMBER',
  memberId: 'STU-2025-001',
  teamCode: 'TEAM-A',
  pictureUrl: 'https://via.placeholder.com/150',
  emailVerified: true,
  active: true,
  isProfileComplete: true,
  accountStatus: 'ACTIVE',
  createdAt: '2025-01-15T10:30:00',
};

export const mockManagerUser = {
  id: 2,
  email: 'professor@school.edu',
  name: 'Dr. Jane Professor',
  role: 'MANAGER',
  managerId: 'FAC-2025-042',
  facultyId: 'FAC-2025-042',
  department: 'Computer Science',
  pictureUrl: 'https://via.placeholder.com/150',
  emailVerified: true,
  active: true,
  isProfileComplete: true,
  accountStatus: 'ACTIVE',
  createdAt: '2025-01-10T09:00:00',
};

export const mockAdminUser = {
  id: 3,
  email: 'admin@school.edu',
  name: 'Admin User',
  role: 'ADMIN',
  adminId: 'ADM-2025-001',
  facultyId: 'ADM-2025-001',
  department: 'Administration',
  pictureUrl: 'https://via.placeholder.com/150',
  emailVerified: true,
  active: true,
  isProfileComplete: true,
  accountStatus: 'ACTIVE',
  createdAt: '2025-01-05T08:00:00',
};

// Mock API responses
export const mockApiCall = (endpoint, method = 'GET', data = null) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(`[MOCK API] ${method} ${endpoint}`, data);

      if (endpoint === '/api/auth/login' && method === 'POST') {
        // Mock login - return different user based on email
        if (data?.email?.includes('professor')) {
          resolve({
            token: 'mock-jwt-token-manager',
            user: mockManagerUser,
          });
        } else if (data?.email?.includes('admin')) {
          resolve({
            token: 'mock-jwt-token-admin',
            user: mockAdminUser,
          });
        } else {
          resolve({
            token: 'mock-jwt-token',
            user: mockUser,
          });
        }
      } else if (endpoint === '/api/auth/register' && method === 'POST') {
        resolve({
          token: null,
          user: { ...mockUser, email: data?.email, name: data?.name },
        });
      } else if (endpoint.includes('/api/users/') && method === 'GET') {
        // Mock get user profile
        resolve(mockUser);
      } else if (endpoint.includes('/api/users/') && method === 'PUT') {
        // Mock update user profile
        resolve({ ...mockUser, ...data });
      } else {
        resolve({ success: true, data });
      }
    }, 500); // Simulate network delay
  });
};

// Override fetch globally for testing
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalFetch = window.fetch;
  window.fetch = function (url, options) {
    const apiUrl = url.toString();
    
    // Intercept API calls
    if (apiUrl.includes('localhost:8080/api/')) {
      const endpoint = apiUrl.replace('http://localhost:8080', '');
      const method = options?.method || 'GET';
      let body = null;

      if (options?.body) {
        try {
          body = JSON.parse(options.body);
        } catch (e) {
          body = options.body;
        }
      }

      return mockApiCall(endpoint, method, body).then((data) => {
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      });
    }

    // Pass through non-API calls
    return originalFetch.apply(this, arguments);
  };
}

export default mockApiCall;
