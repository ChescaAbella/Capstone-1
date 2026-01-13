package com.capstone.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "deliverables")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Deliverable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false)
    private String status; // NOT_STARTED, IN_PROGRESS, COMPLETED, OVERDUE, ON_HOLD

    @Column(nullable = false)
    private Integer progressPercentage; // 0-100

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_team_id", nullable = false)
    private Team assignedTeam;

    @Column
    private String assignedMemberId; // User ID of the member responsible

    @Column(nullable = false)
    private Integer priority; // 1 (highest) to 5 (lowest)

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private String createdBy;

    private String googleSheetRowId; // Track which row in Google Sheets

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        status = "NOT_STARTED";
        progressPercentage = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        // Auto-update status based on progress
        if (progressPercentage == 100) {
            this.status = "COMPLETED";
        } else if (progressPercentage > 0) {
            this.status = "IN_PROGRESS";
        }
    }
}
