package com.cit.submit.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDateTime dueDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;

    @Column(name = "submission_type")
    private String submissionType; // INDIVIDUAL, TEAM, etc.

    @Column(name = "team_code")
    private String teamCode; // If null, for all teams

    @Column(name = "allow_late_submission")
    private Boolean allowLateSubmission = false;

    @Column(name = "max_file_size_mb")
    private Integer maxFileSizeMb = 50;

    @Column(name = "allowed_file_types")
    private String allowedFileTypes; // JSON array or comma-separated

    @Column(name = "is_published")
    private Boolean isPublished = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (submissionType == null) {
            submissionType = "INDIVIDUAL";
        }
        if (allowedFileTypes == null) {
            allowedFileTypes = "pdf,doc,docx,xlsx,xls,txt,zip,pptx";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
