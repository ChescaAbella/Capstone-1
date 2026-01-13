package com.capstone.controller;

import com.capstone.dto.CreateProjectRequest;
import com.capstone.dto.ProjectDTO;
import com.capstone.service.ProjectService;
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
@RequestMapping("/api/v1/projects")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    /**
     * Create a new project
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ProjectDTO> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            Principal principal) {
        log.info("Creating project: {} by user: {}", request.getName(), principal.getName());
        ProjectDTO project = projectService.createProject(request, principal.getName());
        return new ResponseEntity<>(project, HttpStatus.CREATED);
    }

    /**
     * Get all projects
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<ProjectDTO>> getAllProjects() {
        List<ProjectDTO> projects = projectService.getAllProjects();
        return new ResponseEntity<>(projects, HttpStatus.OK);
    }

    /**
     * Get projects by team
     */
    @GetMapping("/team/{teamId}")
    @PreAuthorize("hasAnyRole('USER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<ProjectDTO>> getProjectsByTeam(@PathVariable Long teamId) {
        log.info("Getting projects for team: {}", teamId);
        List<ProjectDTO> projects = projectService.getProjectsByTeam(teamId);
        return new ResponseEntity<>(projects, HttpStatus.OK);
    }

    /**
     * Get projects by status
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('USER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<ProjectDTO>> getProjectsByStatus(@PathVariable String status) {
        log.info("Getting projects with status: {}", status);
        List<ProjectDTO> projects = projectService.getProjectsByStatus(status);
        return new ResponseEntity<>(projects, HttpStatus.OK);
    }

    /**
     * Get project by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ProjectDTO> getProjectById(@PathVariable Long id) {
        ProjectDTO project = projectService.getProjectById(id);
        return new ResponseEntity<>(project, HttpStatus.OK);
    }

    /**
     * Update project status
     */
    @PutMapping("/{id}/status/{status}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ProjectDTO> updateProjectStatus(
            @PathVariable Long id,
            @PathVariable String status) {
        log.info("Updating project: {} status to: {}", id, status);
        ProjectDTO project = projectService.updateProjectStatus(id, status);
        return new ResponseEntity<>(project, HttpStatus.OK);
    }

    /**
     * Get overdue projects
     */
    @GetMapping("/overdue")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<ProjectDTO>> getOverdueProjects() {
        List<ProjectDTO> projects = projectService.getOverdueProjects();
        return new ResponseEntity<>(projects, HttpStatus.OK);
    }

    /**
     * Delete project
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        log.info("Deleting project: {}", id);
        projectService.deleteProject(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
