package com.capstone.controller;

import com.capstone.dto.ApiResponse;
import com.capstone.dto.ProfileUpdateRequest;
import com.capstone.dto.UserInfo;
import com.capstone.model.User;
import com.capstone.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = {"http://localhost:5173", "https://capstonecg-1.vercel.app"}, allowCredentials = "true")
public class ProfileController {

    @Autowired
    private UserService userService;

    /**
     * Get current user's profile
     */
    @GetMapping
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse(false, "Unauthorized", null));
        }

        UserInfo userInfo = new UserInfo(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getPicture(),
                user.getRole().name(),
                user.getPhoneNumber(),
                user.getDepartment(),
                user.getBio(),
                user.getStudentId(),
                user.getYearLevel()
        );

        return ResponseEntity.ok(new ApiResponse(true, "Profile retrieved successfully", userInfo));
    }

    /**
     * Update current user's profile
     */
    @PutMapping
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody ProfileUpdateRequest request) {
        
        if (user == null) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse(false, "Unauthorized", null));
        }

        try {
            User updatedUser = userService.updateProfile(user.getId(), request);
            
            UserInfo userInfo = new UserInfo(
                    updatedUser.getId(),
                    updatedUser.getEmail(),
                    updatedUser.getName(),
                    updatedUser.getPicture(),
                    updatedUser.getRole().name(),
                    updatedUser.getPhoneNumber(),
                    updatedUser.getDepartment(),
                    updatedUser.getBio(),
                    updatedUser.getStudentId(),
                    updatedUser.getYearLevel()
            );

            return ResponseEntity.ok(new ApiResponse(true, "Profile updated successfully", userInfo));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Failed to update profile: " + e.getMessage(), null));
        }
    }
}
