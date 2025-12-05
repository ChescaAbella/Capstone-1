# DeliverEase - Intelligent Deliverable Submission & Tracking System

A web-based Deliverable Submission and Tracking System enhanced with AI-powered insights. DeliverEase streamlines submission management, validates documents, sends smart reminders, and predicts risks of late delivery—reducing human error, speeding up workflows, and improving accountability across teams and organizations.

---

## 🧩 Tech Stack Used

- **Backend:** Spring Boot 3.2.0 (Java 21)
- **Frontend:** React.js 19 + Vite 7
- **Database:** PostgreSQL
- **Authentication:** JWT + OAuth 2.0
- **Security:** Spring Security
- **ORM:** Hibernate/JPA

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Java 17 or higher** - [Download](https://www.oracle.com/java/technologies/downloads/)
- **Maven 3.9+** - [Download](https://maven.apache.org/download.cgi)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)

Verify installation:

```bash
java --version    # Should show 17.x.x or higher
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

### Step 2: Fill in Credentials

Open `backend/src/main/resources/application.properties` and update:

```properties
# Line 8: Database password
spring.datasource.password=YOUR_DB_PASSWORD_HERE

# Line 18-19: OAuth credentials
spring.security.oauth2.client.registration.google.client-id=YOUR_CLIENT_ID_HERE
spring.security.oauth2.client.registration.google.client-secret=YOUR_CLIENT_SECRET_HERE
```

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

| Method | Endpoint           | Description             |
| ------ | ------------------ | ----------------------- |
| POST   | `/api/auth/google` | Login with Google OAuth |
| GET    | `/api/auth/user`   | Get current user info   |
| POST   | `/api/auth/logout` | Logout user             |
| GET    | `/api/auth/test`   | Health check endpoint   |

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

**Current Version:** 0.2.0 (MVP with Registration)  
**Status:** Core frontend functionality complete, backend in development  
**Last Updated:** December 2025

### Completed ✅
- Landing page with feature showcase
- Authentication system (Login & Register)
- Role-based access control (Contributor, Manager, Admin)
- Contributor dashboard
- Manager dashboard
- Administrator dashboard
- Responsive design across all pages
- Reusable component library

### In Progress 🔄
- Backend API development (Spring Boot)
- Database integration (PostgreSQL)
- Google OAuth 2.0 integration
- Real AI predictions

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
| **Abella, Franchesca Louise R.** | Project Leader & Lead Developer | franchescalouise.abella@cit.edu | [@chescaabella](https://github.com/chescaabella) |
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
- **PostgreSQL** - For database
- **Google Cloud Platform** - For OAuth authentication

---

**DeliverEase** - Making Deliverable Tracking Easy 📦  
*Built with React + Vite and Spring Boot for modern applications*
