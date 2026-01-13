package com.capstone.controller;

import com.capstone.dto.MessageResponse;
import com.capstone.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class StudentController {

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getStudentDashboard(@AuthenticationPrincipal User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome to Student Dashboard");
        response.put("user", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole().name());
        
        // Add student-specific data here
        response.put("enrolledCourses", 5);
        response.put("completedAssignments", 12);
        response.put("pendingTasks", 3);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal User user) {
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("picture", user.getPicture());
        profile.put("role", user.getRole().name());
        
        return ResponseEntity.ok(profile);
    }
}