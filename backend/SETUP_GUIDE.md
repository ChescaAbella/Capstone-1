# Module 2: Deliverable Tracker - Backend Setup Guide

## Quick Start

### Prerequisites
- Java 21 JDK
- PostgreSQL/Supabase account
- Google Cloud Project with Sheets API enabled
- Maven 3.8+

### Step 1: Environment Setup

Create a `.env` file in the `backend/` directory:

```properties
# Database Configuration
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/capstone
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_password
SPRING_PROFILES_ACTIVE=local

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret

# Google Sheets API
GOOGLE_SHEETS_API_KEY=your_sheets_api_key

# JWT
JWT_SECRET=your_jwt_secret_key_min_32_chars

# Server
PORT=8080
```

### Step 2: Database Setup

#### Option A: Local PostgreSQL
```bash
# Create database
createdb capstone

# Tables will be auto-created by Hibernate (spring.jpa.hibernate.ddl-auto=update)
```

#### Option B: Supabase
1. Create project on [Supabase](https://supabase.com)
2. Get connection string from project settings
3. Update `SPRING_DATASOURCE_URL` in `.env`

### Step 3: Google Sheets API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable "Google Sheets API"
4. Create OAuth 2.0 credentials:
   - Type: Web application
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:8080/login/oauth2/code/google`
5. Create API key for Sheets API
6. Update `.env` with credentials

### Step 4: Build & Run

```bash
cd backend

# Build project
./mvnw clean install

# Run application
./mvnw spring-boot:run

# Application will start on http://localhost:8080
```

### Step 5: Verify Setup

```bash
# Check health endpoint
curl http://localhost:8080/actuator/health

# Get all teams (requires authentication)
curl -H "Authorization: Bearer <your_jwt_token>" \
  http://localhost:8080/api/v1/teams
```

---

## Database Schema

The following tables are automatically created:

### teams
```sql
CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255)
);
```

### projects
```sql
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  deadline DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  team_id BIGINT NOT NULL REFERENCES teams(id),
  google_sheet_id VARCHAR(255),
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255)
);
```

### deliverables
```sql
CREATE TABLE deliverables (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  project_id BIGINT NOT NULL REFERENCES projects(id),
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'NOT_STARTED',
  progress_percentage INT DEFAULT 0,
  assigned_team_id BIGINT NOT NULL REFERENCES teams(id),
  assigned_member_id VARCHAR(255),
  priority INT,
  google_sheet_row_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255)
);
```

### task_progress
```sql
CREATE TABLE task_progress (
  id SERIAL PRIMARY KEY,
  deliverable_id BIGINT NOT NULL REFERENCES deliverables(id),
  progress_percentage INT NOT NULL,
  notes TEXT,
  updated_by VARCHAR(255),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### refresh_token (from auth module)
```sql
CREATE TABLE refresh_token (
  id SERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expiry_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Project Structure

```
backend/
├── src/main/java/com/capstone/
│   ├── model/                    # JPA Entities
│   │   ├── Project.java
│   │   ├── Deliverable.java
│   │   ├── Team.java
│   │   ├── TaskProgress.java
│   │   ├── User.java (existing)
│   │   └── RefreshToken.java (existing)
│   ├── dto/                      # Data Transfer Objects
│   │   ├── ProjectDTO.java
│   │   ├── DeliverableDTO.java
│   │   ├── TeamDTO.java
│   │   ├── TaskProgressDTO.java
│   │   ├── GanttChartDTO.java
│   │   ├── CreateProjectRequest.java
│   │   ├── CreateDeliverableRequest.java
│   │   ├── CreateTeamRequest.java
│   │   └── UpdateProgressRequest.java
│   ├── repository/               # Spring Data Repositories
│   │   ├── ProjectRepository.java
│   │   ├── DeliverableRepository.java
│   │   ├── TaskProgressRepository.java
│   │   └── TeamRepository.java
│   ├── service/                  # Business Logic
│   │   ├── ProjectService.java
│   │   ├── DeliverableService.java
│   │   ├── TeamService.java
│   │   └── GoogleSheetsService.java
│   ├── controller/               # REST Endpoints
│   │   ├── ProjectController.java
│   │   ├── DeliverableController.java
│   │   └── TeamController.java
│   ├── config/                   # Configuration Classes
│   │   └── ScheduledTasks.java
│   ├── exception/                # Custom Exceptions
│   │   └── ResourceNotFoundException.java
│   ├── security/                 # Security (existing)
│   └── CapstoneApplication.java  # Main Application
├── src/main/resources/
│   ├── application.properties     # Application config
│   └── application-production.properties
├── pom.xml                        # Maven configuration
└── Dockerfile                     # Container config
```

---

## Key Features Implementation

### 1. Timeline View
- **Endpoint**: `GET /api/v1/deliverables/project/{projectId}`
- **Features**: Returns deliverables sorted by due date
- **Frontend Integration**: Pass to timeline/calendar component

### 2. Deadline Tracker
- **Endpoint**: `GET /api/v1/deliverables/overdue`
- **Features**: Identifies past-due deliverables
- **Alerts**: Scheduled check every 30 minutes

### 3. Gantt Chart
- **Endpoint**: `GET /api/v1/deliverables/gantt/project/{projectId}`
- **Response**: Contains startDate, endDate, progress, status
- **Frontend Integration**: Use with Gantt chart library (e.g., AG-Grid, react-gantt)

### 4. Google Sheets Sync
- **Automatic**: Every 5 minutes via `@Scheduled` task
- **Real-time**: Updates on progress change
- **Lag**: <1s as per requirements
- **Data Flow**: Deliverable → GoogleSheetsService → Sheet API

### 5. Drag-and-Drop (UI Layer)
- Backend provides task update endpoints
- Frontend handles drag logic
- Progress updates via `PUT /api/v1/deliverables/{id}/progress`

---

## Testing the Endpoints

### 1. Create Team
```bash
curl -X POST http://localhost:8080/api/v1/teams \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Dev Team","description":"Developers"}'
```

### 2. Create Project
```bash
curl -X POST http://localhost:8080/api/v1/projects \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Mobile App",
    "description":"Build mobile app",
    "deadline":"2025-12-31",
    "teamId":1
  }'
```

### 3. Create Deliverable
```bash
curl -X POST http://localhost:8080/api/v1/deliverables \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"API Integration",
    "projectId":1,
    "startDate":"2025-01-15",
    "dueDate":"2025-02-15",
    "assignedTeamId":1,
    "priority":1
  }'
```

### 4. Update Progress
```bash
curl -X PUT http://localhost:8080/api/v1/deliverables/1/progress \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"progressPercentage":50,"notes":"Half done"}'
```

### 5. Get Gantt Data
```bash
curl -X GET "http://localhost:8080/api/v1/deliverables/gantt/project/1" \
  -H "Authorization: Bearer <token>"
```

---

## Troubleshooting

### Issue: Database Connection Failed
**Solution**:
- Verify `SPRING_DATASOURCE_URL` is correct
- Check PostgreSQL is running: `psql -U postgres`
- Verify credentials in `.env`

### Issue: Google Sheets API Error
**Solution**:
- Verify `GOOGLE_SHEETS_API_KEY` is set
- Check API is enabled in Google Cloud Console
- Verify API key has Sheets API permission

### Issue: JWT Token Invalid
**Solution**:
- Ensure `JWT_SECRET` is at least 32 characters
- Regenerate token via OAuth 2.0 login
- Check token hasn't expired

### Issue: Port Already in Use
**Solution**:
- Change `PORT` in `.env` to different port
- Or kill process: `lsof -i :8080` → `kill -9 <PID>`

---

## Performance Optimization

1. **Database Indexing** - Already configured in entities
2. **Connection Pooling** - HikariCP configured (default)
3. **Query Optimization** - Use JPQL queries instead of N+1
4. **Caching** - Consider adding @Cacheable for frequently accessed data
5. **Pagination** - For large datasets, add PageRequest

Example pagination:
```java
Page<Deliverable> page = deliverableRepository.findAll(PageRequest.of(0, 20));
```

---

## Deployment

### Render (Recommended)
1. Push code to GitHub
2. Connect repository to Render
3. Configure environment variables
4. Deploy with `./mvnw clean install`

### Docker
```bash
# Build image
docker build -t capstone-backend .

# Run container
docker run -e SPRING_DATASOURCE_URL=... \
           -e GOOGLE_SHEETS_API_KEY=... \
           -p 8080:8080 \
           capstone-backend
```

---

## Support

For issues or questions, refer to:
- [MODULE2_API_DOCS.md](./MODULE2_API_DOCS.md) - Complete API documentation
- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [Google Sheets API](https://developers.google.com/sheets)

