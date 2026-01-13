package com.capstone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GanttChartDTO {

    private Long id;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer progress; // 0-100
    private String status;
    private Integer priority;
    private String assignedTeam;
}
