package com.capstone.service;

import com.capstone.dto.*;
import com.capstone.exception.ResourceNotFoundException;
import com.capstone.model.Deliverable;
import com.capstone.model.Project;
import com.capstone.model.Team;
import com.capstone.model.TaskProgress;
import com.capstone.repository.DeliverableRepository;
import com.capstone.repository.ProjectRepository;
import com.capstone.repository.TaskProgressRepository;
import com.capstone.repository.TeamRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class DeliverableService {

    @Autowired
    private DeliverableRepository deliverableRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private TaskProgressRepository taskProgressRepository;

    @Autowired
    private GoogleSheetsService googleSheetsService;

    /**
     * Create a new deliverable
     */
    public DeliverableDTO createDeliverable(CreateDeliverableRequest request, String userId) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        Team assignedTeam = teamRepository.findById(request.getAssignedTeamId())
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        // Validate dates
        if (request.getStartDate().isAfter(request.getDueDate())) {
            throw new IllegalArgumentException("Start date must be before due date");
        }

        Deliverable deliverable = Deliverable.builder()
                .name(request.getName())
                .description(request.getDescription())
                .project(project)
                .startDate(request.getStartDate())
                .dueDate(request.getDueDate())
                .status("NOT_STARTED")
                .progressPercentage(0)
                .assignedTeam(assignedTeam)
                .assignedMemberId(request.getAssignedMemberId())
                .priority(request.getPriority())
                .createdBy(userId)
                .build();

        Deliverable saved = deliverableRepository.save(deliverable);

        // Add to Google Sheet
        addDeliverableToGoogleSheet(project, saved);

        log.info("Created deliverable: {} for project: {}", saved.getId(), project.getId());
        return mapToDTO(saved);
    }

    /**
     * Get all deliverables for a project (Timeline view)
     */
    public List<DeliverableDTO> getDeliverablesByProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        return deliverableRepository.findByProjectIdOrderByDueDate(projectId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get deliverables by team (for team view)
     */
    public List<DeliverableDTO> getDeliverablesByTeam(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        return deliverableRepository.findByAssignedTeam(team).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get active deliverables for a team
     */
    public List<DeliverableDTO> getActiveDeliverablesByTeam(Long teamId) {
        return deliverableRepository.findActiveDeliverablesByTeam(teamId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get deliverable by ID
     */
    public DeliverableDTO getDeliverableById(Long id) {
        Deliverable deliverable = deliverableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deliverable not found"));
        return mapToDTO(deliverable);
    }

    /**
     * Update deliverable progress and status
     */
    public DeliverableDTO updateProgress(Long deliverableId, UpdateProgressRequest request, String userId) {
        Deliverable deliverable = deliverableRepository.findById(deliverableId)
                .orElseThrow(() -> new ResourceNotFoundException("Deliverable not found"));

        deliverable.setProgressPercentage(request.getProgressPercentage());

        // Auto-update status based on progress
        if (request.getProgressPercentage() == 100) {
            deliverable.setStatus("COMPLETED");
        } else if (request.getProgressPercentage() > 0) {
            deliverable.setStatus("IN_PROGRESS");
        } else {
            deliverable.setStatus("NOT_STARTED");
        }

        // Check if overdue
        if (LocalDate.now().isAfter(deliverable.getDueDate()) && request.getProgressPercentage() < 100) {
            deliverable.setStatus("OVERDUE");
        }

        Deliverable updated = deliverableRepository.save(deliverable);

        // Record progress history
        TaskProgress progress = TaskProgress.builder()
                .deliverable(deliverable)
                .progressPercentage(request.getProgressPercentage())
                .notes(request.getNotes())
                .updatedBy(userId)
                .build();

        taskProgressRepository.save(progress);

        // Update Google Sheet
        updateDeliverableInGoogleSheet(deliverable);

        log.info("Updated progress for deliverable: {} to {}%", deliverableId, request.getProgressPercentage());
        return mapToDTO(updated);
    }

    /**
     * Get overdue deliverables
     */
    public List<DeliverableDTO> getOverdueDeliverables() {
        LocalDate today = LocalDate.now();
        return deliverableRepository.findAll().stream()
                .filter(d -> d.getDueDate().isBefore(today) && !d.getStatus().equals("COMPLETED"))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get at-risk deliverables (less than 100% complete and due soon)
     */
    public List<DeliverableDTO> getAtRiskDeliverables() {
        return deliverableRepository.findAtRiskDeliverables().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get Gantt chart data
     */
    public List<GanttChartDTO> getGanttChartData(Long projectId) {
        return deliverableRepository.findByProjectIdOrderByDueDate(projectId).stream()
                .map(this::mapToGanttDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get deadline tracker (upcoming deliverables)
     */
    public List<DeliverableDTO> getUpcomingDeliverables(int days) {
        LocalDate today = LocalDate.now();
        LocalDate futureDate = today.plusDays(days);

        return deliverableRepository.findAll().stream()
                .filter(d -> !d.getStatus().equals("COMPLETED") &&
                        d.getDueDate().isAfter(today) &&
                        d.getDueDate().isBefore(futureDate.plusDays(1)))
                .sorted((d1, d2) -> d1.getDueDate().compareTo(d2.getDueDate()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Delete deliverable
     */
    public void deleteDeliverable(Long id) {
        deliverableRepository.deleteById(id);
    }

    /**
     * Sync all deliverables with Google Sheet
     */
    @Transactional
    public void syncAllWithGoogleSheets() {
        List<Deliverable> deliverables = deliverableRepository.findAll();

        for (Deliverable deliverable : deliverables) {
            updateDeliverableInGoogleSheet(deliverable);
        }

        log.info("Synced {} deliverables with Google Sheets", deliverables.size());
    }

    /**
     * Add deliverable to Google Sheet
     */
    private void addDeliverableToGoogleSheet(Project project, Deliverable deliverable) {
        if (project.getGoogleSheetId() == null || project.getGoogleSheetId().isEmpty()) {
            return;
        }

        List<Object> rowData = Arrays.asList(
                deliverable.getName(),
                project.getName(),
                deliverable.getStartDate().toString(),
                deliverable.getDueDate().toString(),
                deliverable.getStatus(),
                deliverable.getProgressPercentage() + "%",
                deliverable.getAssignedTeam().getName(),
                deliverable.getPriority(),
                LocalDateTime.now().toString()
        );

        googleSheetsService.addDeliverableRow(project.getGoogleSheetId(), rowData);
    }

    /**
     * Update deliverable in Google Sheet
     */
    private void updateDeliverableInGoogleSheet(Deliverable deliverable) {
        Project project = deliverable.getProject();
        if (project.getGoogleSheetId() == null || project.getGoogleSheetId().isEmpty()) {
            return;
        }

        List<Object> rowData = Arrays.asList(
                deliverable.getName(),
                project.getName(),
                deliverable.getStartDate().toString(),
                deliverable.getDueDate().toString(),
                deliverable.getStatus(),
                deliverable.getProgressPercentage() + "%",
                deliverable.getAssignedTeam().getName(),
                deliverable.getPriority(),
                LocalDateTime.now().toString()
        );

        // Update the range - in a production app, you'd track the exact row
        googleSheetsService.updateDeliverableRow(project.getGoogleSheetId(), "Sheet1!A2:I2", rowData);
    }

    /**
     * Map Deliverable to DeliverableDTO
     */
    private DeliverableDTO mapToDTO(Deliverable deliverable) {
        return DeliverableDTO.builder()
                .id(deliverable.getId())
                .name(deliverable.getName())
                .description(deliverable.getDescription())
                .projectId(deliverable.getProject().getId())
                .projectName(deliverable.getProject().getName())
                .startDate(deliverable.getStartDate())
                .dueDate(deliverable.getDueDate())
                .status(deliverable.getStatus())
                .progressPercentage(deliverable.getProgressPercentage())
                .assignedTeamId(deliverable.getAssignedTeam().getId())
                .assignedTeamName(deliverable.getAssignedTeam().getName())
                .assignedMemberId(deliverable.getAssignedMemberId())
                .priority(deliverable.getPriority())
                .createdAt(deliverable.getCreatedAt())
                .updatedAt(deliverable.getUpdatedAt())
                .createdBy(deliverable.getCreatedBy())
                .googleSheetRowId(deliverable.getGoogleSheetRowId())
                .build();
    }

    /**
     * Map Deliverable to GanttChartDTO
     */
    private GanttChartDTO mapToGanttDTO(Deliverable deliverable) {
        return GanttChartDTO.builder()
                .id(deliverable.getId())
                .name(deliverable.getName())
                .startDate(deliverable.getStartDate())
                .endDate(deliverable.getDueDate())
                .progress(deliverable.getProgressPercentage())
                .status(deliverable.getStatus())
                .priority(deliverable.getPriority())
                .assignedTeam(deliverable.getAssignedTeam().getName())
                .build();
    }
}
