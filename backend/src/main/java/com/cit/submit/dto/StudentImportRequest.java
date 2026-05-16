package com.cit.submit.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentImportRequest {
    private String email;
    private String teamCode;
    private String studentName;
    private String studentId;
}
