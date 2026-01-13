package com.capstone.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "login_audit_logs")
public class LoginAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private LocalDateTime loginTime;

    @Column(nullable = false)
    private String ipAddress;

    @Column(nullable = false)
    private Boolean success;

    @Column(columnDefinition = "TEXT")
    private String failureReason;

    @Column(columnDefinition = "TEXT")
    private String userAgent;

    @Column
    private String authProvider;

    // Constructors
    public LoginAuditLog() {}

    public LoginAuditLog(Long userId, String username, LocalDateTime loginTime, 
                       String ipAddress, Boolean success, String userAgent, String authProvider) {
        this.userId = userId;
        this.username = username;
        this.loginTime = loginTime;
        this.ipAddress = ipAddress;
        this.success = success;
        this.userAgent = userAgent;
        this.authProvider = authProvider;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public LocalDateTime getLoginTime() {
        return loginTime;
    }

    public void setLoginTime(LocalDateTime loginTime) {
        this.loginTime = loginTime;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public String getAuthProvider() {
        return authProvider;
    }

    public void setAuthProvider(String authProvider) {
        this.authProvider = authProvider;
    }
}
