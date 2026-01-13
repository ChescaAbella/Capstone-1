# Module 2: Deliverable Tracker - Backend API Documentation

## Overview
This backend implements Module 2 of the Capstone project: Deliverable Tracker. It provides REST APIs for managing projects, deliverables, and team workflows with automatic Google Sheets synchronization.

## Technology Stack
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 21
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Hibernate/JPA
- **Authentication**: JWT + OAuth 2.0 (Google)
- **Security**: Spring Security
- **Integration**: Google Sheets API v4

## Key Features
1. ✅ **Project Management** - Create and manage projects with deadlines
2. ✅ **Deliverable Tracking** - Track deliverables with progress percentages
3. ✅ **Team Management** - Organize deliverables by teams
4. ✅ **Google Sheets Sync** - <1s sync lag for real-time data synchronization
5. ✅ **Timeline View** - Visualize deliverables in chronological order
6. ✅ **Deadline Tracker** - Monitor overdue and upcoming deliverables
7. ✅ **Gantt Chart Data** - Provide structured data for Gantt chart visualization
8. ✅ **Progress Tracking** - Maintain history of all progress updates
9. ✅ **Scheduled Tasks** - Automatic background sync and monitoring

## API Endpoints

### Teams API

#### Create Team
```
POST /api/v1/teams
Authorization: Required (ADMIN)
Request Body: {
  "name": "string",
  "description": "string"
}
Response: 201 Created
```

#### Get All Teams
```
GET /api/v1/teams
Authorization: Required (USER, MANAGER, ADMIN)
Response: 200 OK - List<TeamDTO>
```

#### Get Active Teams
```
GET /api/v1/teams/active
Authorization: Required (USER, MANAGER, ADMIN)
Response: 200 OK - List<TeamDTO>
```

#### Get Team by ID
```
GET /api/v1/teams/{id}
Authorization: Required (USER, MANAGER, ADMIN)
Response: 200 OK - TeamDTO
```

#### Update Team
```
PUT /api/v1/teams/{id}
Authorization: Required (ADMIN)
Request Body: {
  "name": "string",
  "description": "string"
}
Response: 200 OK - TeamDTO
```

#### Archive Team
```
PUT /api/v1/teams/{id}/archive
Authorization: Required (ADMIN)
Response: 200 OK - TeamDTO
```

#### Search Teams
```
GET /api/v1/teams/search?keyword=string
Authorization: Required (USER, MANAGER, ADMIN)
Response: 200 OK - List<TeamDTO>
```

#### Delete Team
```
DELETE /api/v1/teams/{id}
Authorization: Required (ADMIN)
Response: 204 No Content
```

---

### Projects API

#### Create Project
```
POST /api/v1/projects
Authorization: Required (MANAGER, ADMIN)
Request Body: {
  "name": "string (required)",
  "description": "string",
  "deadline": "date (YYYY-MM-DD, required)",
  "teamId": "long (required)"
}
Response: 201 Created - ProjectDTO
Note: Automatically creates Google Sheet and initializes headers
```

#### Get All Projects
```
GET /api/v1/projects
Authorization: Required (USER, MANAGER, ADMIN)
Response: 200 OK - List<ProjectDTO>
```

#### Get Projects by Team
```
GET /api/v1/projects/team/{teamId}
Authorization: Required (USER, MANAGER, ADMIN)
Response: 200 OK - List<ProjectDTO>
```

#### Get Projects by Status
```
GET /api/v1/projects/status/{status}
Authorization: Required (USER, MANAGER, ADMIN)
Path Variables: ACTIVE, COMPLETED, ON_HOLD, DELAYED
Response: 200 OK - List<ProjectDTO>
```

#### Get Project by ID
```
GET /api/v1/projects/{id}
Authorization: Required (USER, MANAGER, ADMIN)
Response: 200 OK - ProjectDTO
```

#### Update Project Status
```
PUT /api/v1/projects/{id}/status/{status}
Authorization: Required (MANAGER, ADMIN)
Path Variables: status = ACTIVE, COMPLETED, ON_HOLD, DELAYED
Response: 200 OK - ProjectDTO
```

#### Get Overdue Projects
```
GET /api/v1/projects/overdue
Authorization: Required (MANAGER, ADMIN)
Response: 200 OK - List<ProjectDTO>
```

#### Delete Project
```
DELETE /api/v1/projects/{id}
Authorization: Required (ADMIN)
Response: 204 No Content
```

---

### Deliverables API

#### Create Deliverable
```
POST /api/v1/deliverables
Authorization: Required (MANAGER, ADMIN)
Request Body: {
  "name": "string (required)",
  "description": "string",
  "projectId": "long (required)",
  "startDate": "date (YYYY-MM-DD, required)",
  "dueDate": "date (YYYY-MM-DD, required)",
  "assignedTeamId": "long (required)",
  "assignedMemberId": "string",
  "priority": "integer 1-5 (required)"
}
Response: 201 Created - DeliverableDTO
Note: Auto-synced to project's Google Sheet
```

#### Get Deliverables by Project (Timeline View)
```
GET /api/v1/deliverables/project/{projectId}
Authorization: Required (USER, MANAGER, ADMIN)
Response: 200 OK - List<DeliverableDTO> (sorted by due date)
```

#### Get Deliverables by Team
```
GET /api/v1/deliverables/team/{teamId}
Authorization: Required (USER, MANAGER, ADMIN)
Response: 200 OK - List<DeliverableDTO>
```

#### Get Active Deliverables by Team
```
GET /api/v1/deliverables/team/{teamId}/active
Authorization: Required (USER, MANAGER, ADMIN)
Response: 200 OK - List<DeliverableDTO> (excludes completed)
```

#### Get Deliverable by ID
```
GET /api/v1/deliverables/{id}
Authorization: Required (USER, MANAGER, ADMIN)
Response: 200 OK - DeliverableDTO
```

#### Update Deliverable Progress
```
PUT /api/v1/deliverables/{id}/progress
Authorization: Required (USER, MANAGER, ADMIN)
Request Body: {
  "progressPercentage": "integer 0-100 (required)",
  "notes": "string"
}
Response: 200 OK - DeliverableDTO
Note: 
  - Auto-updates status (NOT_STARTED, IN_PROGRESS, COMPLETED, OVERDUE)
  - Records progress history in TaskProgress table
  - Syncs to Google Sheets automatically
```

#### Get Gantt Chart Data
```
GET /api/v1/deliverables/gantt/project/{projectId}
Authorization: Required (USER, MANAGER, ADMIN)
Response: 200 OK - List<GanttChartDTO>
Note: Returns data optimized for Gantt chart visualization
Structure:
{
  "id": "long",
  "name": "string",
  "startDate": "date",
  "endDate": "date",
  "progress": "integer (0-100)",
  "status": "string",
  "priority": "integer",
  "assignedTeam": "string"
}
```

#### Get Overdue Deliverables (Deadline Tracker)
```
GET /api/v1/deliverables/overdue
Authorization: Required (MANAGER, ADMIN)
Response: 200 OK - List<DeliverableDTO>
Note: Filters deliverables past due date that aren't completed
```

#### Get At-Risk Deliverables
```
GET /api/v1/deliverables/at-risk
Authorization: Required (MANAGER, ADMIN)
Response: 200 OK - List<DeliverableDTO>
Note: Deliverables <100% complete and due within configured threshold
```

#### Get Upcoming Deliverables
```
GET /api/v1/deliverables/upcoming?days=7
Authorization: Required (USER, MANAGER, ADMIN)
Query Parameters: days (optional, default: 7)
Response: 200 OK - List<DeliverableDTO>
Note: Returns deliverables due in next N days
```

#### Delete Deliverable
```
DELETE /api/v1/deliverables/{id}
Authorization: Required (ADMIN)
Response: 204 No Content
```

---

## Data Models

### Team
```json
{
  "id": "long",
  "name": "string (unique)",
  "description": "string",
  "status": "ACTIVE | INACTIVE | ARCHIVED",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "createdBy": "string",
  "projectCount": "integer"
}
```

### Project
```json
{
  "id": "long",
  "name": "string",
  "description": "string",
  "deadline": "date",
  "status": "ACTIVE | COMPLETED | ON_HOLD | DELAYED",
  "teamId": "long",
  "teamName": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "createdBy": "string",
  "googleSheetId": "string",
  "lastSyncedAt": "datetime"
}
```

### Deliverable
```json
{
  "id": "long",
  "name": "string",
  "description": "string",
  "projectId": "long",
  "projectName": "string",
  "startDate": "date",
  "dueDate": "date",
  "status": "NOT_STARTED | IN_PROGRESS | COMPLETED | OVERDUE | ON_HOLD",
  "progressPercentage": "integer (0-100)",
  "assignedTeamId": "long",
  "assignedTeamName": "string",
  "assignedMemberId": "string",
  "assignedMemberName": "string",
  "priority": "integer (1-5)",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "createdBy": "string",
  "googleSheetRowId": "string"
}
```

### TaskProgress
```json
{
  "id": "long",
  "deliverableId": "long",
  "deliverableName": "string",
  "progressPercentage": "integer (0-100)",
  "notes": "string",
  "updatedBy": "string",
  "recordedAt": "datetime",
  "createdAt": "datetime"
}
```

---

## Scheduled Tasks

### Google Sheets Sync
- **Interval**: Every 5 minutes
- **Purpose**: Synchronize all deliverables with Google Sheets
- **Target Lag**: <1s (as per non-functional requirements)
- **Triggered By**: `ScheduledTasks.syncDeliverablesToGoogleSheets()`

### Overdue Check
- **Interval**: Every 30 minutes
- **Purpose**: Identify and track overdue deliverables
- **Triggered By**: `ScheduledTasks.checkOverdueDeliverables()`

### At-Risk Check
- **Interval**: Every 1 hour
- **Purpose**: Identify deliverables at risk of missing deadlines
- **Triggered By**: `ScheduledTasks.checkAtRiskDeliverables()`

---

## Google Sheets Integration

### Sheet Structure
Every project automatically gets a Google Sheet with the following headers:
1. Deliverable Name
2. Project
3. Start Date
4. Due Date
5. Status
6. Progress %
7. Assigned Team
8. Priority
9. Last Updated

### Synchronization Flow
1. Deliverable created → Added to Google Sheet (via `addDeliverableRow()`)
2. Progress updated → Google Sheet row updated (via `updateDeliverableRow()`)
3. Scheduled sync (every 5 min) → All deliverables synced

### Required Environment Variables
```
GOOGLE_SHEETS_API_KEY=<your-api-key>
GOOGLE_SHEETS_CREDENTIALS_PATH=<optional-path-to-credentials>
```

---

## Authentication & Authorization

### JWT
- Token generated after OAuth 2.0 login
- Stored in HTTP-only cookies
- Included in `Authorization: Bearer <token>` header for API calls

### OAuth 2.0 (Google)
- Users login via Google
- Email and profile information retrieved
- User record created/updated in database

### Role-Based Access Control (RBAC)
- **USER**: Can view and update their own deliverables
- **MANAGER**: Can create/manage projects and deliverables
- **ADMIN**: Full system access including team management

---

## Error Handling

### Standard Error Response
```json
{
  "status": "integer",
  "message": "string",
  "timestamp": "datetime"
}
```

### Common Status Codes
- **200 OK**: Successful GET request
- **201 Created**: Successful POST request
- **204 No Content**: Successful DELETE request
- **400 Bad Request**: Validation error
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

---

## Environment Configuration

### Local Development (.env file)
```properties
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/capstone
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=password
SPRING_PROFILES_ACTIVE=local

GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
GOOGLE_SHEETS_API_KEY=<your-api-key>

JWT_SECRET=<your-jwt-secret>

PORT=8080
```

### Production (Render/Supabase)
```properties
SPRING_DATASOURCE_URL=postgresql://user:password@db.supabase.co:5432/postgres
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=<supabase-password>
SPRING_PROFILES_ACTIVE=production

GOOGLE_CLIENT_ID=<production-client-id>
GOOGLE_CLIENT_SECRET=<production-client-secret>
GOOGLE_SHEETS_API_KEY=<production-api-key>

JWT_SECRET=<production-jwt-secret>

PORT=8080
```

---

## Testing

### Example Requests

#### 1. Create a Team
```bash
curl -X POST http://localhost:8080/api/v1/teams \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Development Team",
    "description": "Main development team"
  }'
```

#### 2. Create a Project
```bash
curl -X POST http://localhost:8080/api/v1/projects \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mobile App",
    "description": "iOS/Android app development",
    "deadline": "2025-12-31",
    "teamId": 1
  }'
```

#### 3. Create a Deliverable
```bash
curl -X POST http://localhost:8080/api/v1/deliverables \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Integration",
    "description": "Integrate backend APIs",
    "projectId": 1,
    "startDate": "2025-01-15",
    "dueDate": "2025-02-15",
    "assignedTeamId": 1,
    "assignedMemberId": "user123",
    "priority": 1
  }'
```

#### 4. Update Progress
```bash
curl -X PUT http://localhost:8080/api/v1/deliverables/1/progress \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "progressPercentage": 50,
    "notes": "API endpoints completed, testing in progress"
  }'
```

#### 5. Get Gantt Chart Data
```bash
curl -X GET http://localhost:8080/api/v1/deliverables/gantt/project/1 \
  -H "Authorization: Bearer <token>"
```

---

## Performance Considerations

1. **Database Indexing**: Queries include:
   - Index on `project_id` in deliverables table
   - Index on `team_id` in projects table
   - Index on `deliverable_id` in task_progress table
   - Index on `due_date` and `status` for filtering

2. **Caching**: Consider implementing Redis for:
   - Project list caching
   - Team list caching
   - Deliverable counts/stats

3. **Google Sheets Sync**: 
   - Batch operations when possible
   - Scheduled tasks avoid real-time lag
   - Async processing for large datasets

---

## Future Enhancements

1. **WebSocket Support**: Real-time progress updates
2. **Email Notifications**: Alerts for deadlines
3. **Mobile App Integration**: Native mobile support
4. **Advanced Filtering**: Complex query builders
5. **Export Features**: PDF/Excel export of timelines
6. **Audit Logging**: Track all changes with user/timestamp
7. **Webhooks**: External system integrations
8. **Multi-language Support**: Internationalization

---

## Support & Documentation

For additional information, refer to:
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Google Sheets API Documentation](https://developers.google.com/sheets)
- [Spring Security Documentation](https://spring.io/projects/spring-security)
- Project README.md

---

**Backend Version**: 0.0.1-SNAPSHOT  
**Last Updated**: January 2025
