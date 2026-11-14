// Local API used when the frontend is run without the Spring backend.
export const mockUser = {
  id: 1,
  email: 'student@school.edu',
  name: 'John Student',
  role: 'STUDENT',
  studentId: 'STU-2025-001',
  teamCode: 'TEAM-A',
  pictureUrl: 'https://via.placeholder.com/150',
  emailVerified: true,
  active: true,
  isProfileComplete: true,
  accountStatus: 'ACTIVE',
  createdAt: '2025-01-15T10:30:00',
};

export const mockTeacherUser = {
  id: 2,
  email: 'professor@school.edu',
  name: 'Dr. Jane Professor',
  role: 'TEACHER',
  teacherId: 'FAC-2025-042',
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

const mockAssignments = [
  {
    id: 101,
    title: 'Capstone Proposal',
    description: 'Submit your project proposal and initial scope.',
    dueDate: '2026-12-10T23:59:00',
    submissionType: 'DOCUMENT',
    teamCode: 'TEAM-A',
    maxFileSizeMb: 50,
    allowedFileTypes: 'PDF, DOCX, ZIP',
    allowLateSubmission: true,
    status: 'PUBLISHED',
  },
  {
    id: 102,
    title: 'Final Project Deliverables',
    description: 'Upload the final documentation and presentation.',
    dueDate: '2026-12-20T23:59:00',
    submissionType: 'DOCUMENT',
    teamCode: 'TEAM-A',
    maxFileSizeMb: 50,
    allowedFileTypes: 'PDF, DOCX, PPTX, ZIP',
    allowLateSubmission: false,
    status: 'PUBLISHED',
  },
];

const initialUsers = [mockUser, mockTeacherUser, mockAdminUser];
let users = [...initialUsers];
let auditLogs = [
  { id: 1, action: 'SYSTEM_START', description: 'Local demo data loaded', createdAt: new Date().toISOString() },
];

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const getUserFromRequest = (options = {}) => {
  const requestedId = options.headers?.['X-User-Id'] || options.headers?.['x-user-id'];
  return users.find((item) => String(item.id) === String(requestedId)) || mockUser;
};

const parseBody = (options = {}) => {
  if (!options.body) return {};
  try {
    return JSON.parse(options.body);
  } catch {
    return {};
  }
};

const getUsersFromStorage = () => {
  try {
    const savedUsers = localStorage.getItem('mockUsers');
    return savedUsers ? JSON.parse(savedUsers) : users;
  } catch {
    return users;
  }
};

const saveUsers = () => {
  localStorage.setItem('mockUsers', JSON.stringify(users));
};

const createMockResponse = (endpoint, method, data, options) => {
  const currentUser = getUserFromRequest(options);

  if (endpoint === '/api/auth/login' && method === 'POST') {
    const email = String(data.email || '').toLowerCase();
    const role = data.role;
    const user = email.includes('admin') || role === 'admin'
      ? mockAdminUser
      : email.includes('professor') || email.includes('teacher') || role === 'teacher'
        ? mockTeacherUser
        : mockUser;
    return { token: `local-token-${user.role.toLowerCase()}`, user };
  }

  if (endpoint === '/api/auth/register' && method === 'POST') {
    const newUser = {
      ...mockUser,
      id: Date.now(),
      name: data.name || 'New Student',
      email: data.email,
      studentId: data.studentId || '',
      teamCode: data.team || '',
    };
    users = [...getUsersFromStorage(), newUser];
    saveUsers();
    return { token: null, user: newUser };
  }

  if (endpoint === '/api/auth/google' && method === 'POST') {
    return { token: 'local-google-token', user: mockUser };
  }

  if (endpoint === '/api/submissions/published' || endpoint === '/api/submissions/available') {
    return mockAssignments;
  }

  if (endpoint === '/api/submissions/my-submissions') {
    return mockAssignments.map((assignment) => ({
      ...assignment,
      createdBy: mockTeacherUser.id,
      submissions: assignment.id === 101 ? 1 : 0,
    }));
  }

  if (endpoint === '/api/admin/users' && method === 'GET') {
    return getUsersFromStorage();
  }

  if (endpoint === '/api/admin/users' && method === 'POST') {
    const newUser = {
      ...mockUser,
      ...data,
      id: Date.now(),
      role: String(data.role || 'contributor').toUpperCase() === 'CONTRIBUTOR' ? 'STUDENT' : String(data.role || 'STUDENT').toUpperCase(),
      accountStatus: 'ACTIVE',
    };
    users = [...getUsersFromStorage(), newUser];
    saveUsers();
    return newUser;
  }

  if (endpoint === '/api/admin/audit-logs') {
    return auditLogs;
  }

  const userMatch = endpoint.match(/^\/api\/admin\/users\/(\d+)\/(role|deactivate|reactivate)$/);
  if (userMatch && method === 'PUT') {
    const userId = Number(userMatch[1]);
    const action = userMatch[2];
    const queryRole = new URLSearchParams(endpoint.split('?')[1] || '').get('role');
    users = getUsersFromStorage().map((item) => {
      if (item.id !== userId) return item;
      if (action === 'role') return { ...item, role: String(queryRole || item.role).toUpperCase() };
      return { ...item, active: action === 'reactivate', accountStatus: action === 'reactivate' ? 'ACTIVE' : 'INACTIVE' };
    });
    saveUsers();
    auditLogs = [{ id: Date.now(), action: action.toUpperCase(), userId, createdAt: new Date().toISOString() }, ...auditLogs];
    return { success: true };
  }

  const profileMatch = endpoint.match(/^\/api\/users\/(\d+)(?:\/photo)?$/);
  if (profileMatch && method === 'GET') {
    return users.find((item) => item.id === Number(profileMatch[1])) || currentUser;
  }

  if (profileMatch && method === 'PUT') {
    users = getUsersFromStorage().map((item) =>
      item.id === Number(profileMatch[1]) ? { ...item, ...data } : item
    );
    saveUsers();
    return users.find((item) => item.id === Number(profileMatch[1])) || currentUser;
  }

  return { success: true, data };
};

export const mockApiCall = (endpoint, method = 'GET', data = null) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(createMockResponse(endpoint, method, data, {}));
    }, 500); // Simulate network delay
  });
};

// Intercept API requests in the browser so every screen works without a backend.
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = function (url, options) {
    const apiUrl = url.toString();
    
    if (apiUrl.includes('/api/')) {
      const parsedUrl = new URL(apiUrl, window.location.origin);
      const endpoint = `${parsedUrl.pathname}${parsedUrl.search}`;
      const method = options?.method || 'GET';
      const body = parseBody(options);
      return Promise.resolve(jsonResponse(createMockResponse(endpoint, method, body, options)));
    }

    return originalFetch.apply(this, arguments);
  };
}

export default mockApiCall;
