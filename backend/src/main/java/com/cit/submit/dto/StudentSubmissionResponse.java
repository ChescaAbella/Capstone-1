package com.cit.submit.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentSubmissionResponse {
    private Long id;
    private Long submissionId;
    private String submissionTitle;
    private String studentEmail;
    private String studentName;
    private String teamCode;
    private String fileName;
    private Double fileSizeMb;
    private String submissionStatus;
    private LocalDateTime submittedAt;
    private Boolean isLate;
    private Double grade;
    private String feedback;
    private LocalDateTime gradedAt;
    private LocalDateTime createdAt;

    public StudentSubmissionResponse(com.cit.submit.model.StudentSubmission ss) {
        this.id = ss.getId();
        this.submissionId = ss.getSubmission().getId();
        this.submissionTitle = ss.getSubmission().getTitle();
        this.studentEmail = ss.getStudent().getEmail();
        this.studentName = ss.getStudent().getName();
        this.teamCode = ss.getStudent().getTeamCode();
        this.fileName = ss.getFileName();
        this.fileSizeMb = ss.getFileSizeMb();
        this.submissionStatus = ss.getSubmissionStatus();
        this.submittedAt = ss.getSubmittedAt();
        this.isLate = ss.getIsLate();
        this.grade = ss.getGrade();
        this.feedback = ss.getFeedback();
        this.gradedAt = ss.getGradedAt();
        this.createdAt = ss.getCreatedAt();
    }
}
