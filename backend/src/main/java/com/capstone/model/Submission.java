package com.capstone.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Submission entity for tracking deliverable submissions
 */
@Data
@Entity
@Table(name = "submissions")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Submission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deliverable_id", nullable = false)
    private Deliverable deliverable;
    
    @Column(name = "submitted_by", nullable = false)
    private String submittedBy;
    
    @Column(name = "file_name", nullable = false, length = 512)
    private String fileName;
    
    @Column(name = "file_data", nullable = false)
    @org.hibernate.annotations.JdbcTypeCode(java.sql.Types.BINARY)
    private byte[] fileData;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @Column(name = "file_type", length = 512)
    private String fileType;
    
    @Column(name = "google_drive_file_id")
    private String googleDriveFileId;
    
    @Column(name = "status", nullable = false)
    private String status; // SUBMITTED, APPROVED, REJECTED, REVISION_NEEDED
    
    @Column(name = "feedback")
    private String feedback;
    
    @Column(name = "is_latest", nullable = false)
    @Builder.Default
    private Boolean isLatest = true;
    
    @Column(name = "version_number", nullable = false)
    @Builder.Default
    private Integer versionNumber = 1;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        status = "SUBMITTED";
        isLatest = true;
        versionNumber = 1;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
