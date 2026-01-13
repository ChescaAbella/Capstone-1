import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../Dashboard/DashboardLayout';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Select } from '../../components/Input';
import { Alert } from '../../components/Alert';
import { getAllProjects, getProjectById } from '../../services/projectService';
import { getGanttChartData } from '../../services/deliverableService';
import './GanttChart.css';

const GanttChartPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [ganttData, setGanttData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projectDetails, setProjectDetails] = useState(null);

  // Timeline state
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [timelineWidth, setTimelineWidth] = useState(0);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Load gantt data when project changes
  useEffect(() => {
    if (selectedProjectId) {
      loadGanttData(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getAllProjects();
      setProjects(data);
      
      // Select first project by default
      if (data.length > 0) {
        setSelectedProjectId(data[0].id);
      }
    } catch (err) {
      setError('Failed to load projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadGanttData = async (projectId) => {
    try {
      setLoading(true);
      setError('');
      
      // Get project details
      const projDetails = await getProjectById(projectId);
      setProjectDetails(projDetails);
      
      // Get gantt chart data
      const data = await getGanttChartData(projectId);
      setGanttData(data || []);
      
      // Calculate timeline bounds
      if (data && data.length > 0) {
        const dates = data.flatMap(item => [
          new Date(item.startDate),
          new Date(item.endDate)
        ]);
        
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        
        // Add buffer (1 week before and after)
        minDate.setDate(minDate.getDate() - 7);
        maxDate.setDate(maxDate.getDate() + 7);
        
        setStartDate(minDate);
        setEndDate(maxDate);
      }
    } catch (err) {
      setError('Failed to load gantt data');
      console.error(err);
      setGanttData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'COMPLETED': '#28a745',
      'IN_PROGRESS': '#007bff',
      'AT_RISK': '#ffc107',
      'OVERDUE': '#dc3545',
      'NOT_STARTED': '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'COMPLETED': 'Completed',
      'IN_PROGRESS': 'In Progress',
      'AT_RISK': 'At Risk',
      'OVERDUE': 'Overdue',
      'NOT_STARTED': 'Not Started'
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      5: 'Critical',
      4: 'High',
      3: 'Medium',
      2: 'Low',
      1: 'Minimal'
    };
    return labels[priority] || `P${priority}`;
  };

  const calculateBarPosition = (itemStart) => {
    if (!startDate || !endDate) return 0;
    
    const total = endDate - startDate;
    const offset = new Date(itemStart) - startDate;
    
    return (offset / total) * 100;
  };

  const calculateBarWidth = (itemStart, itemEnd) => {
    if (!startDate || !endDate) return 0;
    
    const total = endDate - startDate;
    const duration = new Date(itemEnd) - new Date(itemStart);
    
    return (duration / total) * 100;
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading && ganttData.length === 0) {
    return (
      <DashboardLayout>
        <div className="gantt-page">
          <div className="loading">Loading gantt chart...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="gantt-page">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>📊 Project Timeline (Gantt Chart)</h1>
            <p>Visualize project deliverables and deadlines</p>
          </div>
          <Button onClick={() => navigate(-1)} variant="secondary">
            ← Back
          </Button>
        </div>

        {/* Alerts */}
        {error && <Alert variant="error">{error}</Alert>}

        {/* Project Selector */}
        <Card className="selector-card">
          <div className="selector-content">
            <label>Select Project:</label>
            <select
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(parseInt(e.target.value))}
              className="project-select"
            >
              <option value="">Choose a project...</option>
              {projects.map(proj => (
                <option key={proj.id} value={proj.id}>
                  {proj.name}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Project Details */}
        {projectDetails && (
          <Card className="project-info-card">
            <div className="project-info">
              <div className="info-item">
                <span className="label">Status:</span>
                <span className="value">{projectDetails.status}</span>
              </div>
              <div className="info-item">
                <span className="label">Team:</span>
                <span className="value">{projectDetails.teamName || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="label">Created:</span>
                <span className="value">{formatDate(projectDetails.createdAt)}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Gantt Chart */}
        {ganttData.length === 0 ? (
          <Card className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No Deliverables Found</h3>
            <p>This project has no deliverables yet.</p>
          </Card>
        ) : (
          <Card className="gantt-container">
            <div className="gantt-wrapper">
              {/* Deliverables List (Left side) */}
              <div className="gantt-list">
                <div className="list-header">
                  <div className="list-title">Deliverables ({ganttData.length})</div>
                </div>
                
                {ganttData.map((item, idx) => {
                  const daysLeft = getDaysRemaining(item.endDate);
                  
                  return (
                    <div key={item.id || idx} className="gantt-item-row">
                      <div className="item-details">
                        <div className="item-name">{item.name}</div>
                        <div className="item-meta">
                          <span className="meta-badge">
                            {getPriorityLabel(item.priority)}
                          </span>
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(item.status) }}
                          >
                            {getStatusLabel(item.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Timeline Chart (Right side) */}
              <div className="gantt-chart">
                <div className="timeline-header">
                  <div className="timeline-ruler">
                    {/* Timeline markers */}
                    {startDate && endDate && (() => {
                      const dates = [];
                      const current = new Date(startDate);
                      
                      while (current <= endDate) {
                        dates.push(new Date(current));
                        current.setDate(current.getDate() + 14); // 2-week intervals
                      }
                      
                      return dates.map((date, idx) => (
                        <div key={idx} className="marker">
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Gantt Bars */}
                <div className="timeline-bars">
                  {ganttData.map((item, idx) => {
                    const leftPos = calculateBarPosition(item.startDate);
                    const width = calculateBarWidth(item.startDate, item.endDate);
                    const daysLeft = getDaysRemaining(item.endDate);
                    
                    return (
                      <div key={item.id || idx} className="bar-row">
                        <div
                          className="gantt-bar"
                          style={{
                            left: `${leftPos}%`,
                            width: `${width}%`,
                            backgroundColor: getStatusColor(item.status),
                            opacity: item.progress ? (item.progress / 100 + 0.3) : 0.5
                          }}
                          title={`${item.name}: ${formatDate(item.startDate)} to ${formatDate(item.endDate)}`}
                        >
                          <div className="bar-progress">
                            {item.progress > 0 && (
                              <div 
                                className="progress-fill"
                                style={{ width: `${item.progress}%` }}
                              />
                            )}
                          </div>
                          <span className="bar-label">{item.progress}%</span>
                        </div>
                        
                        {/* Days remaining indicator */}
                        {daysLeft <= 7 && daysLeft > 0 && (
                          <div className="deadline-warning">
                            🔔 {daysLeft}d
                          </div>
                        )}
                        {daysLeft <= 0 && (
                          <div className="deadline-overdue">
                            ⚠️ Overdue
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="gantt-legend">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#28a745' }}></div>
                <span>Completed</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#007bff' }}></div>
                <span>In Progress</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#ffc107' }}></div>
                <span>At Risk</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#dc3545' }}></div>
                <span>Overdue</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#6c757d' }}></div>
                <span>Not Started</span>
              </div>
            </div>

            {/* Stats */}
            <div className="gantt-stats">
              <div className="stat">
                <div className="stat-value">
                  {ganttData.filter(d => d.status === 'COMPLETED').length}
                </div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat">
                <div className="stat-value">
                  {ganttData.filter(d => d.status === 'IN_PROGRESS').length}
                </div>
                <div className="stat-label">In Progress</div>
              </div>
              <div className="stat">
                <div className="stat-value">
                  {ganttData.length > 0 ? Math.round(ganttData.reduce((sum, d) => sum + (d.progress || 0), 0) / ganttData.length) : 0}%
                </div>
                <div className="stat-label">Avg Progress</div>
              </div>
              <div className="stat">
                <div className="stat-value">
                  {ganttData.filter(d => d.status === 'OVERDUE').length}
                </div>
                <div className="stat-label">Overdue</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GanttChartPage;
