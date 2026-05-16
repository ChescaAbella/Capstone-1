package com.cit.submit.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSubmissionRequest {
    private String title;
    private String description;
    private LocalDateTime dueDate;
    private String submissionType; // INDIVIDUAL, TEAM
    private String teamCode; // Optional - null means all teams
    private Boolean allowLateSubmission;
    private Integer maxFileSizeMb;
    private String allowedFileTypes; // comma-separated
    private Boolean isPublished;
}
