package com.capstone.controller;

import com.capstone.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/leader")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class LeaderController {

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('LEADER')")
    public ResponseEntity<?> getLeaderDashboard(@AuthenticationPrincipal User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome to Leader Dashboard");
        response.put("user", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole().name());
        
        // Add leader-specific data here
        response.put("teamMembers", 8);
        response.put("activeProjects", 3);
        response.put("upcomingDeadlines", 5);
        response.put("teamPerformance", "85%");
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/team")
    @PreAuthorize("hasRole('LEADER')")
    public ResponseEntity<?> getTeamInfo(@AuthenticationPrincipal User user) {
        Map<String, Object> teamInfo = new HashMap<>();
        teamInfo.put("leaderId", user.getId());
        teamInfo.put("leaderName", user.getName());
        teamInfo.put("teamSize", 8);
        teamInfo.put("teamStatus", "Active");
        
        return ResponseEntity.ok(teamInfo);
    }
}