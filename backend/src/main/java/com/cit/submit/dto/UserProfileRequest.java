package com.cit.submit.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileRequest {
    private String name;
    private String studentId;
    private String teamCode;
    private String facultyId;
    private String department;
    private String pictureUrl;
}
