package com.cit.submit.dto;

import com.cit.submit.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAdminRequest {
    private String name;
    private String email;
    private UserRole role;
    private String studentId;
    private String facultyId;
    private String teamCode;
    private String department;
    private String passwordHash;
    private Boolean active;
}
