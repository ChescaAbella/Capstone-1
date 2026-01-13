package com.capstone.controller;

import com.capstone.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/adviser")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AdviserController {

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADVISER')")
    public ResponseEntity<?> getAdviserDashboard(@AuthenticationPrincipal User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome to Adviser Dashboard");
        response.put("user", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole().name());
        
        // Add adviser-specific data here
        response.put("totalTeams", 5);
        response.put("totalStudents", 40);
        response.put("pendingReviews", 7);
        response.put("upcomingMeetings", 3);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/teams")
    @PreAuthorize("hasRole('ADVISER')")
    public ResponseEntity<?> getAllTeams(@AuthenticationPrincipal User user) {
        Map<String, Object> teamsInfo = new HashMap<>();
        teamsInfo.put("adviserId", user.getId());
        teamsInfo.put("adviserName", user.getName());
        teamsInfo.put("totalTeams", 5);
        teamsInfo.put("activeProjects", 5);
        
        return ResponseEntity.ok(teamsInfo);
    }

    @GetMapping("/students")
    @PreAuthorize("hasRole('ADVISER')")
    public ResponseEntity<?> getAllStudents(@AuthenticationPrincipal User user) {
        Map<String, Object> studentsInfo = new HashMap<>();
        studentsInfo.put("totalStudents", 40);
        studentsInfo.put("activeStudents", 38);
        
        return ResponseEntity.ok(studentsInfo);
    }
}