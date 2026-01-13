package com.capstone.controller;

import com.capstone.dto.*;
import com.capstone.service.DeliverableService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/deliverables")
public class DeliverableController {

    @Autowired
    private DeliverableService deliverableService;

    /**
     * Create a new deliverable
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<DeliverableDTO> createDeliverable(
            @Valid @RequestBody CreateDeliverableRequest request,
            Principal principal) {
        log.info("Creating deliverable: {} by user: {}", request.getName(), principal.getName());
        DeliverableDTO deliverable = deliverableService.createDeliverable(request, principal.getName());
        return new ResponseEntity<>(deliverable, HttpStatus.CREATED);
    }

    /**
     * Get deliverables by project (Timeline View)
     */
    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasAnyRole('USER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<DeliverableDTO>> getDeliverablesByProject(@PathVariable Long projectId) {
        log.info("Getting deliverables for project: {}", projectId);
        List<DeliverableDTO> deliverables = deliverableService.getDeliverablesByProject(projectId);
        return new ResponseEntity<>(deliverables, HttpStatus.OK);
    }

    /**
     * Get deliverables by team
     */
    @GetMapping("/team/{teamId}")
    @PreAuthorize("hasAnyRole('USER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<DeliverableDTO>> getDeliverablesByTeam(@PathVariable Long teamId) {
        log.info("Getting deliverables for team: {}", teamId);
        List<DeliverableDTO> deliverables = deliverableService.getDeliverablesByTeam(teamId);
        return new ResponseEntity<>(deliverables, HttpStatus.OK);
    }

    /**
     * Get active deliverables for team
     */
    @GetMapping("/team/{teamId}/active")
    @PreAuthorize("hasAnyRole('USER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<DeliverableDTO>> getActiveDeliverablesByTeam(@PathVariable Long teamId) {
        log.info("Getting active deliverables for team: {}", teamId);
        List<DeliverableDTO> deliverables = deliverableService.getActiveDeliverablesByTeam(teamId);
        return new ResponseEntity<>(deliverables, HttpStatus.OK);
    }

    /**
     * Get deliverable by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<DeliverableDTO> getDeliverableById(@PathVariable Long id) {
        DeliverableDTO deliverable = deliverableService.getDeliverableById(id);
        return new ResponseEntity<>(deliverable, HttpStatus.OK);
    }

    /**
     * Update deliverable progress
     */
    @PutMapping("/{id}/progress")
    @PreAuthorize("hasAnyRole('USER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<DeliverableDTO> updateProgress(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProgressRequest request,
            Principal principal) {
        log.info("Updating progress for deliverable: {} by user: {}", id, principal.getName());
        DeliverableDTO deliverable = deliverableService.updateProgress(id, request, principal.getName());
        return new ResponseEntity<>(deliverable, HttpStatus.OK);
    }

    /**
     * Get Gantt chart data for project
     */
    @GetMapping("/gantt/project/{projectId}")
    @PreAuthorize("hasAnyRole('USER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<GanttChartDTO>> getGanttChartData(@PathVariable Long projectId) {
        log.info("Getting Gantt chart data for project: {}", projectId);
        List<GanttChartDTO> ganttData = deliverableService.getGanttChartData(projectId);
        return new ResponseEntity<>(ganttData, HttpStatus.OK);
    }

    /**
     * Get overdue deliverables (Deadline Tracker)
     */
    @GetMapping("/overdue")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<DeliverableDTO>> getOverdueDeliverables() {
        log.info("Getting overdue deliverables");
        List<DeliverableDTO> deliverables = deliverableService.getOverdueDeliverables();
        return new ResponseEntity<>(deliverables, HttpStatus.OK);
    }

    /**
     * Get at-risk deliverables
     */
    @GetMapping("/at-risk")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<DeliverableDTO>> getAtRiskDeliverables() {
        log.info("Getting at-risk deliverables");
        List<DeliverableDTO> deliverables = deliverableService.getAtRiskDeliverables();
        return new ResponseEntity<>(deliverables, HttpStatus.OK);
    }

    /**
     * Get upcoming deliverables (next X days)
     */
    @GetMapping("/upcoming")
    @PreAuthorize("hasAnyRole('USER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<DeliverableDTO>> getUpcomingDeliverables(
            @RequestParam(defaultValue = "7") int days) {
        log.info("Getting upcoming deliverables for next {} days", days);
        List<DeliverableDTO> deliverables = deliverableService.getUpcomingDeliverables(days);
        return new ResponseEntity<>(deliverables, HttpStatus.OK);
    }

    /**
     * Delete deliverable
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDeliverable(@PathVariable Long id) {
        log.info("Deleting deliverable: {}", id);
        deliverableService.deleteDeliverable(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
