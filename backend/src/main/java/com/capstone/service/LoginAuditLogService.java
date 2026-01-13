package com.capstone.service;

import com.capstone.entity.LoginAuditLog;
import com.capstone.repository.LoginAuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LoginAuditLogService {

    @Autowired
    private LoginAuditLogRepository loginAuditLogRepository;

    /**
     * Log a successful or failed login attempt
     */
    public LoginAuditLog logLogin(Long userId, String username, String ipAddress, 
                                  Boolean success, String userAgent, String authProvider, 
                                  String failureReason) {
        LoginAuditLog auditLog = new LoginAuditLog(
            userId,
            username,
            LocalDateTime.now(),
            ipAddress,
            success,
            userAgent,
            authProvider
        );
        auditLog.setFailureReason(failureReason);
        return loginAuditLogRepository.save(auditLog);
    }

    /**
     * Log a successful login attempt
     */
    public LoginAuditLog logSuccessfulLogin(Long userId, String username, String ipAddress, 
                                            String userAgent, String authProvider) {
        return logLogin(userId, username, ipAddress, true, userAgent, authProvider, null);
    }

    /**
     * Log a failed login attempt
     */
    public LoginAuditLog logFailedLogin(String username, String ipAddress, 
                                       String userAgent, String failureReason) {
        return logLogin(null, username, ipAddress, false, userAgent, null, failureReason);
    }

    /**
     * Get all audit logs
     */
    public List<LoginAuditLog> getAllAuditLogs() {
        return loginAuditLogRepository.findAll();
    }

    /**
     * Get audit logs by user ID
     */
    public List<LoginAuditLog> getAuditLogsByUserId(Long userId) {
        return loginAuditLogRepository.findByUserIdOrderByLoginTimeDesc(userId);
    }

    /**
     * Get audit logs by username
     */
    public List<LoginAuditLog> getAuditLogsByUsername(String username) {
        return loginAuditLogRepository.findByUsernameOrderByLoginTimeDesc(username);
    }

    /**
     * Get audit logs by login status (success/failure)
     */
    public List<LoginAuditLog> getAuditLogsByStatus(Boolean success) {
        return loginAuditLogRepository.findByLoginStatus(success);
    }

    /**
     * Get audit logs within a date range
     */
    public List<LoginAuditLog> getAuditLogsByDateRange(LocalDateTime startTime, LocalDateTime endTime) {
        return loginAuditLogRepository.findAuditLogsByDateRange(startTime, endTime);
    }

    /**
     * Search audit logs by username or IP address
     */
    public List<LoginAuditLog> searchAuditLogs(String query) {
        return loginAuditLogRepository.searchAuditLogs(query);
    }

    /**
     * Get recent audit logs (last N records)
     */
    public List<LoginAuditLog> getRecentAuditLogs(int limit) {
        return loginAuditLogRepository.findAll().stream()
            .sorted((a, b) -> b.getLoginTime().compareTo(a.getLoginTime()))
            .limit(limit)
            .toList();
    }

    /**
     * Delete audit logs older than specified date
     */
    public void deleteOlderThan(LocalDateTime dateTime) {
        loginAuditLogRepository.findAll().stream()
            .filter(log -> log.getLoginTime().isBefore(dateTime))
            .forEach(log -> loginAuditLogRepository.delete(log));
    }

    /**
     * Get statistics for dashboard
     */
    public LoginAuditStatistics getStatistics() {
        List<LoginAuditLog> allLogs = loginAuditLogRepository.findAll();
        long totalLogins = allLogs.size();
        long successfulLogins = allLogs.stream().filter(LoginAuditLog::getSuccess).count();
        long failedLogins = totalLogins - successfulLogins;

        return new LoginAuditStatistics(totalLogins, successfulLogins, failedLogins);
    }

    public static class LoginAuditStatistics {
        public final long totalLogins;
        public final long successfulLogins;
        public final long failedLogins;
        public final double successRate;

        public LoginAuditStatistics(long totalLogins, long successfulLogins, long failedLogins) {
            this.totalLogins = totalLogins;
            this.successfulLogins = successfulLogins;
            this.failedLogins = failedLogins;
            this.successRate = totalLogins > 0 ? (successfulLogins / (double) totalLogins) * 100 : 0;
        }
    }
}
