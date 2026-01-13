package com.capstone.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "task_progress")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deliverable_id", nullable = false)
    private Deliverable deliverable;

    @Column(nullable = false)
    private Integer progressPercentage;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    private String updatedBy;

    @Column(nullable = false)
    private LocalDateTime recordedAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        recordedAt = LocalDateTime.now();
    }
}
