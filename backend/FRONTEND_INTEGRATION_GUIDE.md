# Frontend Integration Guide - Module 2: Deliverable Tracker

## Quick Integration Checklist

- [ ] Backend running on `http://localhost:8080`
- [ ] `.env` file configured with API base URL
- [ ] axios or fetch interceptor set up for JWT auth
- [ ] CORS origin configured in backend

---

## Environment Variables (.env.local)

```javascript
// Add to frontend/.env.local
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_AUTH_CALLBACK_URL=http://localhost:5173/auth/callback
```

---

## API Service Setup

Create `frontend/src/services/deliverableService.js`:

```javascript
import axios from 'axios';

const API_BASE = process.env.VITE_API_BASE_URL;

// Get JWT token from localStorage (set after OAuth login)
const getHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

// ============ TEAMS ============
export const teamService = {
  createTeam: (data) => 
    axios.post(`${API_BASE}/teams`, data, { headers: getHeaders() }),
  
  getAllTeams: () => 
    axios.get(`${API_BASE}/teams`, { headers: getHeaders() }),
  
  getActiveTeams: () => 
    axios.get(`${API_BASE}/teams/active`, { headers: getHeaders() }),
  
  getTeamById: (id) => 
    axios.get(`${API_BASE}/teams/${id}`, { headers: getHeaders() }),
  
  updateTeam: (id, data) => 
    axios.put(`${API_BASE}/teams/${id}`, data, { headers: getHeaders() }),
  
  archiveTeam: (id) => 
    axios.put(`${API_BASE}/teams/${id}/archive`, {}, { headers: getHeaders() }),
  
  searchTeams: (keyword) => 
    axios.get(`${API_BASE}/teams/search?keyword=${keyword}`, { headers: getHeaders() })
};

// ============ PROJECTS ============
export const projectService = {
  createProject: (data) => 
    axios.post(`${API_BASE}/projects`, data, { headers: getHeaders() }),
  
  getAllProjects: () => 
    axios.get(`${API_BASE}/projects`, { headers: getHeaders() }),
  
  getProjectsByTeam: (teamId) => 
    axios.get(`${API_BASE}/projects/team/${teamId}`, { headers: getHeaders() }),
  
  getProjectsByStatus: (status) => 
    axios.get(`${API_BASE}/projects/status/${status}`, { headers: getHeaders() }),
  
  getProjectById: (id) => 
    axios.get(`${API_BASE}/projects/${id}`, { headers: getHeaders() }),
  
  updateProjectStatus: (id, status) => 
    axios.put(`${API_BASE}/projects/${id}/status/${status}`, {}, { headers: getHeaders() }),
  
  getOverdueProjects: () => 
    axios.get(`${API_BASE}/projects/overdue`, { headers: getHeaders() })
};

// ============ DELIVERABLES ============
export const deliverableService = {
  createDeliverable: (data) => 
    axios.post(`${API_BASE}/deliverables`, data, { headers: getHeaders() }),
  
  getDeliverablesByProject: (projectId) => 
    axios.get(`${API_BASE}/deliverables/project/${projectId}`, { headers: getHeaders() }),
  
  getDeliverablesByTeam: (teamId) => 
    axios.get(`${API_BASE}/deliverables/team/${teamId}`, { headers: getHeaders() }),
  
  getActiveDeliverablesByTeam: (teamId) => 
    axios.get(`${API_BASE}/deliverables/team/${teamId}/active`, { headers: getHeaders() }),
  
  getDeliverableById: (id) => 
    axios.get(`${API_BASE}/deliverables/${id}`, { headers: getHeaders() }),
  
  updateProgress: (id, data) => 
    axios.put(`${API_BASE}/deliverables/${id}/progress`, data, { headers: getHeaders() }),
  
  getGanttChartData: (projectId) => 
    axios.get(`${API_BASE}/deliverables/gantt/project/${projectId}`, { headers: getHeaders() }),
  
  getOverdueDeliverables: () => 
    axios.get(`${API_BASE}/deliverables/overdue`, { headers: getHeaders() }),
  
  getAtRiskDeliverables: () => 
    axios.get(`${API_BASE}/deliverables/at-risk`, { headers: getHeaders() }),
  
  getUpcomingDeliverables: (days = 7) => 
    axios.get(`${API_BASE}/deliverables/upcoming?days=${days}`, { headers: getHeaders() })
};
```

---

## Component Examples

### 1. Timeline View Component

```jsx
import React, { useEffect, useState } from 'react';
import { deliverableService } from '@/services/deliverableService';

export function TimelineView({ projectId }) {
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const response = await deliverableService.getDeliverablesByProject(projectId);
        setDeliverables(response.data);
      } catch (error) {
        console.error('Failed to fetch timeline:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [projectId]);

  if (loading) return <div>Loading timeline...</div>;

  return (
    <div className="timeline">
      {deliverables.map((deliverable) => (
        <div key={deliverable.id} className="timeline-item">
          <h3>{deliverable.name}</h3>
          <p>Due: {deliverable.dueDate}</p>
          <div className="progress-bar">
            <div style={{ width: `${deliverable.progressPercentage}%` }}>
              {deliverable.progressPercentage}%
            </div>
          </div>
          <span className={`status ${deliverable.status}`}>
            {deliverable.status}
          </span>
        </div>
      ))}
    </div>
  );
}
```

### 2. Gantt Chart Component

```jsx
import React, { useEffect, useState } from 'react';
import { deliverableService } from '@/services/deliverableService';
// import { Chart } from 'ag-grid-react'; // or your preferred Gantt library

export function GanttChartView({ projectId }) {
  const [ganttData, setGanttData] = useState([]);

  useEffect(() => {
    const fetchGanttData = async () => {
      try {
        const response = await deliverableService.getGanttChartData(projectId);
        // Transform data for your Gantt library
        setGanttData(response.data);
      } catch (error) {
        console.error('Failed to fetch Gantt data:', error);
      }
    };

    fetchGanttData();
  }, [projectId]);

  return (
    <div className="gantt-container">
      {/* Render Gantt chart with ganttData */}
      {ganttData.map((item) => (
        <div key={item.id} className="gantt-row">
          <span>{item.name}</span>
          <div 
            className="gantt-bar"
            style={{
              left: `${calculatePosition(item.startDate)}%`,
              width: `${calculateWidth(item.startDate, item.endDate)}%`
            }}
          >
            {item.progress}%
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 3. Progress Update Component (Drag-and-Drop Ready)

```jsx
import React, { useState } from 'react';
import { deliverableService } from '@/services/deliverableService';

export function ProgressUpdater({ deliverable, onUpdate }) {
  const [progress, setProgress] = useState(deliverable.progressPercentage);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProgressUpdate = async () => {
    setLoading(true);
    try {
      const response = await deliverableService.updateProgress(deliverable.id, {
        progressPercentage: progress,
        notes: notes
      });
      onUpdate(response.data);
      alert('Progress updated successfully!');
    } catch (error) {
      console.error('Failed to update progress:', error);
    } finally {
      setLoading(false);
    }
  };

  // For drag-and-drop, this handler can be called from parent component
  const handleDragDrop = (newProgress) => {
    setProgress(newProgress);
    // Optionally auto-save on drag
    deliverableService.updateProgress(deliverable.id, {
      progressPercentage: newProgress,
      notes: 'Updated via drag-and-drop'
    });
  };

  return (
    <div className="progress-updater">
      <h3>{deliverable.name}</h3>
      <input
        type="range"
        min="0"
        max="100"
        value={progress}
        onChange={(e) => setProgress(parseInt(e.target.value))}
        className="progress-slider"
      />
      <span>{progress}%</span>
      
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add notes about progress..."
      />
      
      <button 
        onClick={handleProgressUpdate} 
        disabled={loading}
      >
        {loading ? 'Updating...' : 'Update Progress'}
      </button>
    </div>
  );
}
```

### 4. Deadline Tracker Component

```jsx
import React, { useEffect, useState } from 'react';
import { deliverableService } from '@/services/deliverableService';

export function DeadlineTracker() {
  const [overdue, setOverdue] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        const [overdueRes, upcomingRes] = await Promise.all([
          deliverableService.getOverdueDeliverables(),
          deliverableService.getUpcomingDeliverables(7)
        ]);
        setOverdue(overdueRes.data);
        setUpcoming(upcomingRes.data);
      } catch (error) {
        console.error('Failed to fetch deadlines:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeadlines();
  }, []);

  if (loading) return <div>Loading deadline tracker...</div>;

  return (
    <div className="deadline-tracker">
      <div className="overdue-section">
        <h2>Overdue ({overdue.length})</h2>
        {overdue.map((item) => (
          <div key={item.id} className="deadline-item overdue">
            <h4>{item.name}</h4>
            <p>Due: {item.dueDate}</p>
            <p>Progress: {item.progressPercentage}%</p>
          </div>
        ))}
      </div>

      <div className="upcoming-section">
        <h2>Upcoming (Next 7 Days)</h2>
        {upcoming.map((item) => (
          <div key={item.id} className="deadline-item upcoming">
            <h4>{item.name}</h4>
            <p>Due: {item.dueDate}</p>
            <p>Progress: {item.progressPercentage}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Data Flow Patterns

### Pattern 1: Create Deliverable with Auto-Sync
```
User Form → Create Deliverable → Backend
→ Save to DB → Add to Google Sheet → Return Success
```

### Pattern 2: Update Progress
```
Drag-Drop → Update Progress → Backend
→ Update DB → Record History → Sync to Sheet → Return Updated Status
```

### Pattern 3: View Timeline
```
Load Project → Fetch Deliverables → Sort by Due Date → Display Timeline
→ Auto-refresh every 30 seconds (optional)
```

---

## Response Format Examples

### Create Deliverable Response
```json
{
  "id": 1,
  "name": "API Integration",
  "projectId": 1,
  "projectName": "Mobile App",
  "startDate": "2025-01-15",
  "dueDate": "2025-02-15",
  "status": "NOT_STARTED",
  "progressPercentage": 0,
  "assignedTeamId": 1,
  "assignedTeamName": "Dev Team",
  "priority": 1,
  "createdAt": "2025-01-13T10:30:00",
  "updatedAt": "2025-01-13T10:30:00",
  "createdBy": "user@example.com"
}
```

### Gantt Chart Response
```json
[
  {
    "id": 1,
    "name": "API Integration",
    "startDate": "2025-01-15",
    "endDate": "2025-02-15",
    "progress": 0,
    "status": "NOT_STARTED",
    "priority": 1,
    "assignedTeam": "Dev Team"
  },
  {
    "id": 2,
    "name": "UI Design",
    "startDate": "2025-01-10",
    "endDate": "2025-02-10",
    "progress": 50,
    "status": "IN_PROGRESS",
    "priority": 2,
    "assignedTeam": "Design Team"
  }
]
```

---

## Common Integration Issues & Solutions

### Issue 1: CORS Error
**Solution**: Ensure backend has CORS configured:
```properties
spring.web.cors.allowed-origins=http://localhost:5173
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
```

### Issue 2: 401 Unauthorized
**Solution**: Check JWT token is sent in header:
```javascript
'Authorization': `Bearer ${localStorage.getItem('token')}`
```

### Issue 3: Null Reference in Gantt Data
**Solution**: Ensure all dates are properly formatted as ISO strings:
```javascript
// Format dates before sending
const data = {
  ...data,
  startDate: new Date(data.startDate).toISOString().split('T')[0],
  dueDate: new Date(data.dueDate).toISOString().split('T')[0]
};
```

### Issue 4: Sync Not Appearing in Google Sheets
**Solution**: 
1. Verify `GOOGLE_SHEETS_API_KEY` is set
2. Wait 5 minutes for scheduled sync
3. Check backend logs for errors
4. Verify project has Google Sheet ID

---

## Testing the Integration

### Test 1: Create Full Workflow
```javascript
// 1. Create team
const teamRes = await teamService.createTeam({
  name: 'Test Team',
  description: 'Test'
});
const teamId = teamRes.data.id;

// 2. Create project
const projectRes = await projectService.createProject({
  name: 'Test Project',
  deadline: '2025-12-31',
  teamId: teamId
});
const projectId = projectRes.data.id;

// 3. Create deliverable
const delRes = await deliverableService.createDeliverable({
  name: 'Test Deliverable',
  projectId: projectId,
  startDate: '2025-01-15',
  dueDate: '2025-02-15',
  assignedTeamId: teamId,
  priority: 1
});

// 4. Update progress
const updateRes = await deliverableService.updateProgress(
  delRes.data.id,
  { progressPercentage: 50, notes: 'Halfway done' }
);

console.log('Full workflow test passed!');
```

---

## Performance Tips

1. **Caching**: Implement local state caching for teams/projects
2. **Pagination**: For large deliverable lists, implement pagination
3. **Debouncing**: Debounce progress updates in real-time scenarios
4. **Lazy Loading**: Load Gantt data only when component mounts

---

## Resources

- **API Docs**: See `MODULE2_API_DOCS.md`
- **Backend Setup**: See `SETUP_GUIDE.md`
- **Complete Summary**: See `IMPLEMENTATION_SUMMARY.md`

---

**Backend Version**: 0.0.1-SNAPSHOT  
**Last Updated**: January 13, 2025  
**Status**: Ready for Frontend Integration ✅
