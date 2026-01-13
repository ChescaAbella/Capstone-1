package com.capstone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateProjectRequest {

    @NotBlank(message = "Project name is required")
    private String name;

    private String description;

    @NotNull(message = "Deadline is required")
    private LocalDate deadline;

    @NotNull(message = "Team ID is required")
    private Long teamId;
}
