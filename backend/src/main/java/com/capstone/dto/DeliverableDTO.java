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
public class DeliverableDTO {

    private Long id;
    private String name;
    private String description;
    private Long projectId;
    private String projectName;
    private LocalDate startDate;
    private LocalDate dueDate;
    private String status;
    private Integer progressPercentage;
    private Long assignedTeamId;
    private String assignedTeamName;
    private String assignedMemberId;
    private String assignedMemberName;
    private Integer priority;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String googleSheetRowId;
}
