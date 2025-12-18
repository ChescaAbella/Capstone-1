package com.cit.submit.dto;

import com.cit.submit.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAdminResponse {
    private Long id;
    private String name;
    private String email;
    private UserRole role;
    private String studentId;
    private String facultyId;
    private String teamCode;
    private String department;
    private Boolean active;
    private Boolean emailVerified;
    private Boolean isProfileComplete;
    private String accountStatus;
    private String createdAt;
    private String approvedAt;
}
