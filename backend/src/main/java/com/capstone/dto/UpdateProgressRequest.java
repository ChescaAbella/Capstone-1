package com.capstone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProgressRequest {

    @NotNull(message = "Progress percentage is required")
    @Min(0)
    @Max(100)
    private Integer progressPercentage;

    private String notes;
}
