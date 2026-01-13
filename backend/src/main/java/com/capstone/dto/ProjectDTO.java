package com.capstone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDTO {

    private Long id;
    private String name;
    private String description;
    private LocalDate deadline;
    private String status;
    private Long teamId;
    private String teamName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String googleSheetId;
    private LocalDateTime lastSyncedAt;
}
