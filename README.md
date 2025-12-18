# DeliverEase - Intelligent Deliverable Submission & Tracking System

A web-based Deliverable Submission and Tracking System enhanced with AI-powered insights. DeliverEase streamlines submission management, validates documents, sends smart reminders, and predicts risks of late delivery—reducing human error, speeding up workflows, and improving accountability across teams and organizations.

---

## 🧩 Tech Stack Used

- **Backend:** Spring Boot 4.0.0 (Java 21)
- **Frontend:** React.js 19 + Vite 7
- **Database:** Supabase (PostgreSQL)
- **Authentication:** JWT + OAuth 2.0 (Google)
- **Security:** Spring Security
- **ORM:** Hibernate/JPA

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Java 21 or higher** - [Download](https://www.oracle.com/java/technologies/downloads/)
- **Maven 3.9+** - [Download](https://maven.apache.org/download.cgi)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)
- **Supabase Account** - [Sign up](https://supabase.com/)

Verify installation:

```bash
java --version    # Should show 21.x.x or higher
mvn --version     # Should show 3.9.x
node --version    # Should show 18.x.x or higher
```

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/DeliverEase.git
cd DeliverEase
```

### 2. Get Credentials from Team Lead

⚠️ **Important:** You need these credentials to run the project:

- Database password
- OAuth Client ID
- OAuth Client Secret

---

## ⚙️ Backend Setup (Spring Boot)

### Step 1: Configure Application Properties

```bash
cd backend

# Copy template to create config file (Windows)
copy src\main\resources\application.properties.example src\main\resources\application.properties

# For Mac/Linux:
cp src/main/resources/application.properties.example src/main/resources/application.properties
```

### Step 2: Set Environment Variables

Create a `.env` file in the `backend` directory with your Supabase credentials:

```properties
SUPABASE_HOST=your-project.supabase.co
SUPABASE_DB_NAME=postgres
SUPABASE_USERNAME=postgres
SUPABASE_PASSWORD=your-database-password

# OAuth credentials (optional, for Google login)
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID=your-client-id
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET=your-client-secret
```

Or set them as system environment variables before running the application.

### Step 3: Run Backend

```bash
# Install dependencies and run
mvn clean install -DskipTests
mvn spring-boot:run
```

✅ **Success indicators:**

- `Started DeliverEaseApplication in X seconds`
- `Tomcat started on port 8080`

🧪 **Test:** Open http://localhost:8080/api/auth/test

- Should display: `"Backend is working!"`

---

## 🎨 Frontend Setup (React + Vite)

### Step 1: Configure Environment Variables

```bash
cd capstone-project

# Copy template to create config file (Windows)
copy .env.example .env.local

# For Mac/Linux:
cp .env.example .env.local
```

### Step 2: Fill in OAuth Client ID

Open `capstone-project/.env.local` and update:

```env
VITE_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
VITE_API_BASE_URL=http://localhost:8080
```

### Step 3: Run Frontend

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

✅ **Success indicators:**

- `VITE v7.x.x ready in xxx ms`
- `Local: http://localhost:5173/`

🧪 **Test:** Open http://localhost:5173

- Should display the login page

---

## 🔐 Security Notes

### ⚠️ Files You Should NEVER Commit:

These files contain sensitive credentials and are excluded via `.gitignore`:

- `backend/src/main/resources/application.properties` (real credentials)
- `capstone-project/.env.local` (real credentials)
- `capstone-project/.env` (any environment file without .example)

### ✅ Files Safe to Commit:

These are templates without real credentials:

- `backend/src/main/resources/application.properties.example`
- `capstone-project/.env.example`

---

## 🧪 Testing the Full System

### Integration Test

**Terminal 1 - Start Backend:**

```bash
cd backend
mvn spring-boot:run
```

Wait for: `Started DeliverEaseApplication`

**Terminal 2 - Start Frontend:**

```bash
cd capstone-project
npm install
npm run dev
```

Wait for: `Local: http://localhost:5173/`

**Browser Test:**

1. Open http://localhost:5173
2. Click "Sign in with Google"
3. Sign in with your email
4. Should redirect to role-based dashboard

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** `Connection refused` or `Authentication failed`

**Solution:**

- Verify database password in `application.properties`
- Check internet connection
- Contact team lead for correct credentials

**Problem:** `Port 8080 already in use`

**Solution (Windows PowerShell):**

```powershell
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

**Mac/Linux:**

```bash
lsof -ti:8080 | xargs kill -9
```

### Frontend Issues

**Problem:** `Network Error` or `CORS error`

**Solution:**

- Ensure backend is running on port 8080
- Check `VITE_API_BASE_URL` in `.env.local`
- Clear browser cache and reload

**Problem:** Google Sign-In not working

**Solution:**

- Verify `VITE_GOOGLE_CLIENT_ID` in `.env.local`
- Contact team lead for correct credentials
- Ensure you're added as test user in Google Cloud Console

**Problem:** Port 5173 already in use

**Solution (Windows PowerShell):**

```powershell
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**Problem:** Module not found errors

**Solution:**

```bash
# Clear node_modules and reinstall
rm -r node_modules, package-lock.json
npm install
npm run dev
```

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint                        | Description                          |
| ------ | ------------------------------- | ------------------------------------ |
| POST   | `/api/auth/register`            | Register with email and password     |
| POST   | `/api/auth/register-oauth`      | Register/login with OAuth provider   |
| POST   | `/api/auth/login`               | Login with credentials               |
| POST   | `/api/auth/verify/{token}`      | Verify email address                 |
| GET    | `/api/auth/test`                | Health check endpoint                |

### User Profile Endpoints

| Method | Endpoint                        | Description                          |
| ------ | ------------------------------- | ------------------------------------ |
| GET    | `/api/users/{id}`               | Get user profile                     |
| PUT    | `/api/users/{id}`               | Update user profile                  |

### Admin Management Endpoints

| Method | Endpoint                          | Description                          |
| ------ | --------------------------------- | ------------------------------------ |
| GET    | `/api/admin/users`                | List all users (admin only)          |
| GET    | `/api/admin/users/{id}`           | Get user details (admin only)        |
| POST   | `/api/admin/users`                | Create new user (admin only)         |
| PUT    | `/api/admin/users/{id}`           | Update user (admin only)             |
| PUT    | `/api/admin/users/{id}/role`      | Change user role (admin only)        |
| PUT    | `/api/admin/users/{id}/deactivate`| Deactivate user (admin only)         |
| PUT    | `/api/admin/users/{id}/reactivate`| Reactivate user (admin only)         |
| GET    | `/api/admin/audit-logs`           | Get all audit logs (admin only)      |
| GET    | `/api/admin/audit-logs/user/{id}` | Get audit logs for user (admin only) |

### Deliverable Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/deliverables` | List all deliverables |
| POST | `/api/deliverables` | Create deliverable |
| PUT | `/api/deliverables/:id` | Update deliverable |
| DELETE | `/api/deliverables/:id` | Delete deliverable |

---

## 🛠️ Development Commands

```bash
# Backend Commands
cd backend
mvn clean install          # Install dependencies
mvn spring-boot:run        # Start development server
mvn test                   # Run tests

# Frontend Commands
cd capstone-project
npm install                # Install dependencies
npm run dev                # Start dev server
npm run build              # Build for production
npm run preview            # Preview production build
```

---

## 📊 Project Status

**Current Version:** 0.4.0 (Module 1: Complete + Admin Management)  
**Status:** Full authentication, profile management, and admin controls implemented  
**Last Updated:** December 2025

### Completed ✅
- User registration with institutional email validation
- Email verification workflow with token expiry
- OAuth 2.0 infrastructure (Google ready)
- Role-based access control (Contributor, Manager, Admin)
- User profile management and editing
- Admin dashboard with user management
- Admin role and account administration
- Audit logging for all admin actions
- Account activation/deactivation
- Role assignment and revocation
- Contributor, Manager, and Admin dashboards
- Responsive design across all pages
- Reusable component library
- Spring Boot backend with Spring Security
- Supabase PostgreSQL integration

### In Progress 🔄
- Gmail API integration for email sending
- Google OAuth 2.0 complete implementation
- Module 2: Deliverable Tracker

### Planned 📋
- Email notifications
- Mobile application
- Advanced analytics
- Workflow automation

---

## 📝 License

This project is developed as an educational capstone project.

---

## 👥 Team Members

| Name                             | Role                                  | CIT-U Email                     | GitHub                                           |
| -------------------------------- | ------------------------------------- | ------------------------------- | ------------------------------------------------ |
| **Abella, Franchesca Louise R.** | Frontend Developer | franchescalouise.abella@cit.edu | [@chescaabella](https://github.com/chescaabella) |
| **Alcarez, Johannah Rhey S.** | Frontend Developer    | johannahrhey.alcarez@cit.edu | [@lovenahnah](https://github.com/lovenahnah) |
| **Gilbuena, Chelter Matthew T.** | Backend Developer     | cheltermatthew.gilbuena@cit.edu    | [@cm6322](https://github.com/cm6322)   |
| **Morre, Lyndon Luke A.** | Backend Developer      | lyndonluke.morre@cit.edu     | [@Mores20](https://github.com/Mores20)         |

---

## 📞 Support

For issues, feature requests, or questions:
- Open an issue on GitHub
- Contact the development team

---

## 🙏 Acknowledgments

- **IT Department Faculty** - For guidance and support
- **Supabase** - For managed PostgreSQL database and real-time capabilities
- **Google Cloud Platform** - For OAuth authentication
- **Spring Framework** - For enterprise Java development

---

**DeliverEase** - Making Deliverable Tracking Easy 📦  
*Built with React + Vite and Spring Boot for modern applications*
