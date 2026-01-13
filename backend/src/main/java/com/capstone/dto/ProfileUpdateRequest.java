package com.capstone.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String name;
    private String phoneNumber;
    private String department;
    private String bio;
    private String studentId;
    private String yearLevel;
    private String picture;
}
