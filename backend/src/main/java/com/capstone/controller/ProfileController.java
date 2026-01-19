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
//add
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;


@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:5173", "https://capstonecg-1.vercel.app"}, allowCredentials = "true")
public class ProfileController {

    @Autowired
    private UserService userService;

    /**
     * Get current user's profile
     */
    @GetMapping("users/{id}")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal String email) {
        if (email == null) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse(false, "Unauthorized", null));
        }

        User user = userService.getUserByEmail(email);
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
    @PutMapping("users/{id}")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal String email,
            @RequestBody ProfileUpdateRequest request) {
        
        if (email == null) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse(false, "Unauthorized", null));
        }

        try {
            User user = userService.getUserByEmail(email);
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

    @PutMapping("users/{id}/photo")
    public ResponseEntity<?> updateUserPhoto(@PathVariable Long id, @RequestParam("photo") MultipartFile photo) {
        try{
            User user = userService.updateUserPhoto(id, photo);
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
            return ResponseEntity.ok(new ApiResponse(true, "Photo update", userInfo))
        }catch(Exception e){
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage(), null));
        }
    }
    @PutMapping("users/{id}/deactivate")
    public ResponseEntity<?> deactitaveUser(@PathVariable Long id){
        try {
            userService.deactivateUser(id);
            return ResponseEntity.ok(new ApiResponse(true, "Account deactivated"), null));
        }catch (Exception e){
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage(), null))
        }
    }
    
}
