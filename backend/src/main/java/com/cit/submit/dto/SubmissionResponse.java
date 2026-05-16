package com.cit.submit.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime dueDate;
    private String submissionType;
    private String teamCode;
    private Boolean allowLateSubmission;
    private Integer maxFileSizeMb;
    private String allowedFileTypes;
    private Boolean isPublished;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long totalStudents;
    private Long submittedCount;
    private Long gradedCount;

    public SubmissionResponse(com.cit.submit.model.Submission submission) {
        this.id = submission.getId();
        this.title = submission.getTitle();
        this.description = submission.getDescription();
        this.dueDate = submission.getDueDate();
        this.submissionType = submission.getSubmissionType();
        this.teamCode = submission.getTeamCode();
        this.allowLateSubmission = submission.getAllowLateSubmission();
        this.maxFileSizeMb = submission.getMaxFileSizeMb();
        this.allowedFileTypes = submission.getAllowedFileTypes();
        this.isPublished = submission.getIsPublished();
        this.createdByName = submission.getCreatedBy() != null ? submission.getCreatedBy().getName() : "";
        this.createdAt = submission.getCreatedAt();
        this.updatedAt = submission.getUpdatedAt();
    }
}
