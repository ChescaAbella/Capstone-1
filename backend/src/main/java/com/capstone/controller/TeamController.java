package com.capstone.controller;

import com.capstone.dto.CreateTeamRequest;
import com.capstone.dto.TeamDTO;
import com.capstone.service.TeamService;
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
@RequestMapping("/api/v1/teams")
public class TeamController {

    @Autowired
    private TeamService teamService;

    /**
     * Create a new team
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TeamDTO> createTeam(
            @Valid @RequestBody CreateTeamRequest request,
            Principal principal) {
        log.info("Creating team: {} by user: {}", request.getName(), principal.getName());
        TeamDTO team = teamService.createTeam(request, principal.getName());
        return new ResponseEntity<>(team, HttpStatus.CREATED);
    }

    /**
     * Get all teams
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<TeamDTO>> getAllTeams() {
        List<TeamDTO> teams = teamService.getAllTeams();
        return new ResponseEntity<>(teams, HttpStatus.OK);
    }

    /**
     * Get active teams
     */
    @GetMapping("/active")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TeamDTO>> getActiveTeams() {
        List<TeamDTO> teams = teamService.getActiveTeams();
        return new ResponseEntity<>(teams, HttpStatus.OK);
    }

    /**
     * Get team by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<TeamDTO> getTeamById(@PathVariable Long id) {
        TeamDTO team = teamService.getTeamById(id);
        return new ResponseEntity<>(team, HttpStatus.OK);
    }

    /**
     * Update team
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TeamDTO> updateTeam(
            @PathVariable Long id,
            @Valid @RequestBody CreateTeamRequest request) {
        log.info("Updating team: {}", id);
        TeamDTO team = teamService.updateTeam(id, request);
        return new ResponseEntity<>(team, HttpStatus.OK);
    }

    /**
     * Archive team
     */
    @PutMapping("/{id}/archive")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TeamDTO> archiveTeam(@PathVariable Long id) {
        log.info("Archiving team: {}", id);
        TeamDTO team = teamService.archiveTeam(id);
        return new ResponseEntity<>(team, HttpStatus.OK);
    }

    /**
     * Search teams
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('USER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<TeamDTO>> searchTeams(@RequestParam String keyword) {
        log.info("Searching teams with keyword: {}", keyword);
        List<TeamDTO> teams = teamService.searchTeams(keyword);
        return new ResponseEntity<>(teams, HttpStatus.OK);
    }

    /**
     * Delete team
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTeam(@PathVariable Long id) {
        log.info("Deleting team: {}", id);
        teamService.deleteTeam(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
