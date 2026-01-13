package com.capstone.service;

import com.capstone.dto.*;
import com.capstone.exception.ResourceNotFoundException;
import com.capstone.model.Deliverable;
import com.capstone.model.Project;
import com.capstone.model.Team;
import com.capstone.repository.DeliverableRepository;
import com.capstone.repository.ProjectRepository;
import com.capstone.repository.TeamRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private GoogleSheetsService googleSheetsService;

    /**
     * Create a new project with Google Sheet integration
     */
    public ProjectDTO createProject(CreateProjectRequest request, String userId) {
        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        // Create Google Sheet for the project
        String googleSheetId = googleSheetsService.createSheet(request.getName());

        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .deadline(request.getDeadline())
                .status("ACTIVE")
                .team(team)
                .googleSheetId(googleSheetId)
                .createdBy(userId)
                .build();

        Project savedProject = projectRepository.save(project);
        log.info("Created project: {} with Google Sheet: {}", savedProject.getId(), googleSheetId);

        return mapToDTO(savedProject);
    }

    /**
     * Get all projects
     */
    public List<ProjectDTO> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get projects by team
     */
    public List<ProjectDTO> getProjectsByTeam(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
        return projectRepository.findByTeam(team).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get projects by status
     */
    public List<ProjectDTO> getProjectsByStatus(String status) {
        return projectRepository.findByStatus(status).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get project by ID
     */
    public ProjectDTO getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        return mapToDTO(project);
    }

    /**
     * Update project status
     */
    public ProjectDTO updateProjectStatus(Long id, String status) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        project.setStatus(status);
        Project updated = projectRepository.save(project);
        return mapToDTO(updated);
    }

    /**
     * Check for overdue projects
     */
    public List<ProjectDTO> getOverdueProjects() {
        return projectRepository.findByDeadlineBefore(LocalDate.now()).stream()
                .filter(p -> !p.getStatus().equals("COMPLETED"))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get project statistics
     */
    public ProjectStatsDTO getProjectStats(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // Count deliverables by status (you'll need to inject DeliverableRepository)
        return ProjectStatsDTO.builder()
                .projectId(projectId)
                .projectName(project.getName())
                .status(project.getStatus())
                .build();
    }

    /**
     * Delete project
     */
    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }

    /**
     * Map Project to ProjectDTO
     */
    private ProjectDTO mapToDTO(Project project) {
        return ProjectDTO.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .deadline(project.getDeadline())
                .status(project.getStatus())
                .teamId(project.getTeam().getId())
                .teamName(project.getTeam().getName())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .createdBy(project.getCreatedBy())
                .googleSheetId(project.getGoogleSheetId())
                .lastSyncedAt(project.getLastSyncedAt())
                .build();
    }
}
