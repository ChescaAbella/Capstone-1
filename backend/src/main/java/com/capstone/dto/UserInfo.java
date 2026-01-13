package com.capstone.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInfo {
    private Long id;
    private String email;
    private String name;
    private String picture;
    private String role;
    private String phoneNumber;
    private String department;
    private String bio;
    private String studentId;
    private String yearLevel;
    
    // Constructor for backward compatibility (without profile fields)
    public UserInfo(Long id, String email, String name, String picture, String role) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.picture = picture;
        this.role = role;
    }
}