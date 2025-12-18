package com.cit.submit.dto;

import java.time.LocalDateTime;

public class AuditLogResponse {
    private Long id;
    private Long adminId;
    private String adminName;
    private Long targetUserId;
    private String targetUserEmail;
    private String action;
    private String description;
    private String changedFields;
    private LocalDateTime timestamp;

    public AuditLogResponse() {}

    public AuditLogResponse(Long id, Long adminId, String adminName, Long targetUserId, String targetUserEmail, 
                            String action, String description, String changedFields, LocalDateTime timestamp) {
        this.id = id;
        this.adminId = adminId;
        this.adminName = adminName;
        this.targetUserId = targetUserId;
        this.targetUserEmail = targetUserEmail;
        this.action = action;
        this.description = description;
        this.changedFields = changedFields;
        this.timestamp = timestamp;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getAdminId() { return adminId; }
    public void setAdminId(Long adminId) { this.adminId = adminId; }

    public String getAdminName() { return adminName; }
    public void setAdminName(String adminName) { this.adminName = adminName; }

    public Long getTargetUserId() { return targetUserId; }
    public void setTargetUserId(Long targetUserId) { this.targetUserId = targetUserId; }

    public String getTargetUserEmail() { return targetUserEmail; }
    public void setTargetUserEmail(String targetUserEmail) { this.targetUserEmail = targetUserEmail; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getChangedFields() { return changedFields; }
    public void setChangedFields(String changedFields) { this.changedFields = changedFields; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
