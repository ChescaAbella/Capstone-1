package com.capstone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectStatsDTO {

    private Long projectId;
    private String projectName;
    private String status;
    private Integer totalDeliverables;
    private Integer completedDeliverables;
    private Integer overdueDeliverables;
    private Integer inProgressDeliverables;
    private Double completionPercentage;
    private Integer daysUntilDeadline;
}
