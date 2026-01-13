package com.capstone.service;

import com.capstone.dto.CreateTeamRequest;
import com.capstone.dto.TeamDTO;
import com.capstone.exception.ResourceNotFoundException;
import com.capstone.model.Team;
import com.capstone.repository.TeamRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class TeamService {

    @Autowired
    private TeamRepository teamRepository;

    /**
     * Create a new team
     */
    public TeamDTO createTeam(CreateTeamRequest request, String userId) {
        if (teamRepository.findByName(request.getName()).isPresent()) {
            throw new IllegalArgumentException("Team with this name already exists");
        }

        Team team = Team.builder()
                .name(request.getName())
                .description(request.getDescription())
                .status("ACTIVE")
                .createdBy(userId)
                .build();

        Team saved = teamRepository.save(team);
        log.info("Created team: {}", saved.getId());
        return mapToDTO(saved, 0);
    }

    /**
     * Get all teams
     */
    public List<TeamDTO> getAllTeams() {
        return teamRepository.findAll().stream()
                .map(team -> mapToDTO(team, team.getProjects() != null ? team.getProjects().size() : 0))
                .collect(Collectors.toList());
    }

    /**
     * Get active teams
     */
    public List<TeamDTO> getActiveTeams() {
        return teamRepository.findByStatus("ACTIVE").stream()
                .map(team -> mapToDTO(team, team.getProjects() != null ? team.getProjects().size() : 0))
                .collect(Collectors.toList());
    }

    /**
     * Get team by ID
     */
    public TeamDTO getTeamById(Long id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
        return mapToDTO(team, team.getProjects() != null ? team.getProjects().size() : 0);
    }

    /**
     * Update team
     */
    public TeamDTO updateTeam(Long id, CreateTeamRequest request) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        if (request.getName() != null && !request.getName().equals(team.getName())) {
            if (teamRepository.findByName(request.getName()).isPresent()) {
                throw new IllegalArgumentException("Team with this name already exists");
            }
            team.setName(request.getName());
        }

        if (request.getDescription() != null) {
            team.setDescription(request.getDescription());
        }

        Team updated = teamRepository.save(team);
        return mapToDTO(updated, team.getProjects() != null ? team.getProjects().size() : 0);
    }

    /**
     * Archive team
     */
    public TeamDTO archiveTeam(Long id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
        team.setStatus("ARCHIVED");
        Team updated = teamRepository.save(team);
        return mapToDTO(updated, team.getProjects() != null ? team.getProjects().size() : 0);
    }

    /**
     * Search teams by name
     */
    public List<TeamDTO> searchTeams(String keyword) {
        return teamRepository.findByNameContainingIgnoreCase(keyword).stream()
                .map(team -> mapToDTO(team, team.getProjects() != null ? team.getProjects().size() : 0))
                .collect(Collectors.toList());
    }

    /**
     * Delete team
     */
    public void deleteTeam(Long id) {
        teamRepository.deleteById(id);
    }

    /**
     * Map Team to TeamDTO
     */
    private TeamDTO mapToDTO(Team team, int projectCount) {
        return TeamDTO.builder()
                .id(team.getId())
                .name(team.getName())
                .description(team.getDescription())
                .status(team.getStatus())
                .createdAt(team.getCreatedAt())
                .updatedAt(team.getUpdatedAt())
                .createdBy(team.getCreatedBy())
                .projectCount(projectCount)
                .build();
    }
}
