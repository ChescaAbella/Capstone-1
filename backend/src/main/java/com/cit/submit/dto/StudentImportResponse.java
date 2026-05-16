package com.cit.submit.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentImportResponse {
    private Long id;
    private String email;
    private String teamCode;
    private String studentName;
    private String studentId;
    private String importBatchId;
    private Boolean isRegistered;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public StudentImportResponse(com.cit.submit.model.StudentImport studentImport) {
        this.id = studentImport.getId();
        this.email = studentImport.getEmail();
        this.teamCode = studentImport.getTeamCode();
        this.studentName = studentImport.getStudentName();
        this.studentId = studentImport.getStudentId();
        this.importBatchId = studentImport.getImportBatchId();
        this.isRegistered = studentImport.getIsRegistered();
        this.createdAt = studentImport.getCreatedAt();
        this.updatedAt = studentImport.getUpdatedAt();
    }
}
