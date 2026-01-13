package com.capstone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateDeliverableRequest {

    @NotBlank(message = "Deliverable name is required")
    private String name;

    private String description;

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    @NotNull(message = "Assigned team ID is required")
    private Long assignedTeamId;

    private String assignedMemberId;

    @NotNull(message = "Priority is required")
    @Min(1)
    @Max(5)
    private Integer priority;
}
