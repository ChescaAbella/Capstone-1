package com.capstone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskProgressDTO {

    private Long id;
    private Long deliverableId;
    private String deliverableName;
    private Integer progressPercentage;
    private String notes;
    private String updatedBy;
    private LocalDateTime recordedAt;
    private LocalDateTime createdAt;
}
