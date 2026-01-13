package com.capstone.controller;

import com.capstone.dto.ApiResponse;
import com.capstone.model.User;
import com.capstone.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AdminController {

    @Autowired
    private AdminService adminService;

    // Get all users
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // Get user by ID
    @GetMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = adminService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    // Create new user
    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> createUser(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String name = request.get("name");
            String password = request.get("password");
            String roleStr = request.get("role");

            User.Role role = User.Role.valueOf(roleStr.toUpperCase());
            User newUser = adminService.createUser(email, name, password, role);
            
            return ResponseEntity.ok(new ApiResponse(
                true,
                "User created successfully",
                Map.of("user", newUser)
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(
                false,
                e.getMessage(),
                null
            ));
        }
    }

    // Update existing user
    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> updateUser(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        try {
            String name = request.get("name");
            String email = request.get("email");
            String roleStr = request.get("role");

            User.Role role = roleStr != null ? User.Role.valueOf(roleStr.toUpperCase()) : null;
            User updatedUser = adminService.updateUser(id, name, email, role);

            return ResponseEntity.ok(new ApiResponse(
                true,
                "User updated successfully",
                Map.of("user", updatedUser)
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(
                false,
                e.getMessage(),
                null
            ));
        }
    }

    // Update user role
    @PatchMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        try {
            String roleStr = request.get("role");
            User.Role role = User.Role.valueOf(roleStr.toUpperCase());
            
            User updatedUser = adminService.updateUserRole(id, role);

            return ResponseEntity.ok(new ApiResponse(
                true,
                "User role updated successfully",
                Map.of("user", updatedUser)
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(
                false,
                e.getMessage(),
                null
            ));
        }
    }

    // Toggle user active status (soft delete/activate)
    @PatchMapping("/users/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> toggleUserStatus(@PathVariable Long id) {
        try {
            User updatedUser = adminService.toggleUserStatus(id);
            String status = updatedUser.isActive() ? "activated" : "deactivated";
            
            return ResponseEntity.ok(new ApiResponse(
                true,
                "User " + status + " successfully",
                Map.of("user", updatedUser)
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(
                false,
                e.getMessage(),
                null
            ));
        }
    }

    // Delete user (hard delete)
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable Long id) {
        try {
            adminService.deleteUser(id);
            return ResponseEntity.ok(new ApiResponse(
                true,
                "User deleted successfully",
                null
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(
                false,
                e.getMessage(),
                null
            ));
        }
    }

    // Search users
    @GetMapping("/users/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String query) {
        List<User> users = adminService.searchUsers(query);
        return ResponseEntity.ok(users);
    }
}
