package com.capstone.controller;

import com.capstone.dto.ApiResponse;
import com.capstone.entity.LoginAuditLog;
import com.capstone.service.LoginAuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/audit-logs")
@CrossOrigin(origins = {"http://localhost:5173", "https://capstonecg-1.vercel.app"}, allowCredentials = "true")
public class LoginAuditLogController {

    @Autowired
    private LoginAuditLogService loginAuditLogService;

    /**
     * Get all login audit logs (admin only)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllAuditLogs() {
        try {
            List<LoginAuditLog> logs = loginAuditLogService.getAllAuditLogs();
            return ResponseEntity.ok(new ApiResponse(true, "Audit logs retrieved successfully", logs));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Failed to retrieve audit logs: " + e.getMessage(), null));
        }
    }

    /**
     * Get audit logs by username
     */
    @GetMapping("/user/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAuditLogsByUsername(@PathVariable String username) {
        try {
            List<LoginAuditLog> logs = loginAuditLogService.getAuditLogsByUsername(username);
            return ResponseEntity.ok(new ApiResponse(true, "Audit logs retrieved successfully", logs));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Failed to retrieve audit logs: " + e.getMessage(), null));
        }
    }

    /**
     * Get audit logs by user ID
     */
    @GetMapping("/user-id/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAuditLogsByUserId(@PathVariable Long userId) {
        try {
            List<LoginAuditLog> logs = loginAuditLogService.getAuditLogsByUserId(userId);
            return ResponseEntity.ok(new ApiResponse(true, "Audit logs retrieved successfully", logs));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Failed to retrieve audit logs: " + e.getMessage(), null));
        }
    }

    /**
     * Get audit logs by status (successful/failed logins)
     * @param success true for successful, false for failed
     */
    @GetMapping("/status/{success}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAuditLogsByStatus(@PathVariable Boolean success) {
        try {
            List<LoginAuditLog> logs = loginAuditLogService.getAuditLogsByStatus(success);
            return ResponseEntity.ok(new ApiResponse(true, "Audit logs retrieved successfully", logs));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Failed to retrieve audit logs: " + e.getMessage(), null));
        }
    }

    /**
     * Search audit logs by username or IP address
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> searchAuditLogs(@RequestParam String query) {
        try {
            List<LoginAuditLog> logs = loginAuditLogService.searchAuditLogs(query);
            return ResponseEntity.ok(new ApiResponse(true, "Search completed successfully", logs));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Failed to search audit logs: " + e.getMessage(), null));
        }
    }

    /**
     * Get recent audit logs
     */
    @GetMapping("/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getRecentAuditLogs(@RequestParam(defaultValue = "50") int limit) {
        try {
            List<LoginAuditLog> logs = loginAuditLogService.getRecentAuditLogs(limit);
            return ResponseEntity.ok(new ApiResponse(true, "Recent audit logs retrieved successfully", logs));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Failed to retrieve recent audit logs: " + e.getMessage(), null));
        }
    }

    /**
     * Get audit statistics (total logins, successful, failed, success rate)
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getStatistics() {
        try {
            LoginAuditLogService.LoginAuditStatistics stats = loginAuditLogService.getStatistics();
            return ResponseEntity.ok(new ApiResponse(true, "Statistics retrieved successfully", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Failed to retrieve statistics: " + e.getMessage(), null));
        }
    }
}
