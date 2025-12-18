package com.cit.submit.controller;

import com.cit.submit.dto.UserAdminRequest;
import com.cit.submit.dto.UserAdminResponse;
import com.cit.submit.dto.AuditLogResponse;
import com.cit.submit.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestHeader("X-User-Id") Long adminId) {
        try {
            List<UserAdminResponse> users = adminService.getAllUsers(adminId);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id, @RequestHeader("X-User-Id") Long adminId) {
        try {
            UserAdminResponse user = adminService.getUserById(id, adminId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody UserAdminRequest request, @RequestHeader("X-User-Id") Long adminId) {
        try {
            UserAdminResponse user = adminService.createUser(request, adminId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserAdminRequest request, @RequestHeader("X-User-Id") Long adminId) {
        try {
            UserAdminResponse user = adminService.updateUser(id, request, adminId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> changeRole(@PathVariable Long id, @RequestParam String roleStr, @RequestHeader("X-User-Id") Long adminId) {
        try {
            com.cit.submit.model.UserRole role = com.cit.submit.model.UserRole.valueOf(roleStr.toUpperCase());
            UserAdminResponse user = adminService.changeRole(id, role, adminId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PutMapping("/users/{id}/deactivate")
    public ResponseEntity<?> deactivateUser(@PathVariable Long id, @RequestHeader("X-User-Id") Long adminId) {
        try {
            UserAdminResponse user = adminService.deactivateUser(id, adminId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PutMapping("/users/{id}/reactivate")
    public ResponseEntity<?> reactivateUser(@PathVariable Long id, @RequestHeader("X-User-Id") Long adminId) {
        try {
            UserAdminResponse user = adminService.reactivateUser(id, adminId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<?> getAuditLogs(@RequestHeader("X-User-Id") Long adminId) {
        try {
            List<AuditLogResponse> logs = adminService.getAuditLogs(adminId);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/audit-logs/user/{userId}")
    public ResponseEntity<?> getAuditLogsForUser(@PathVariable Long userId, @RequestHeader("X-User-Id") Long adminId) {
        try {
            List<AuditLogResponse> logs = adminService.getAuditLogsForUser(userId, adminId);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(new ErrorResponse(e.getMessage()));
        }
    }

    static class ErrorResponse {
        public String error;
        public ErrorResponse(String error) {
            this.error = error;
        }
    }
}
