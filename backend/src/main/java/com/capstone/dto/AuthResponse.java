package com.capstone.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private String role;
    private UserInfo user;
    
    public AuthResponse(String accessToken, String refreshToken, String role, UserInfo user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.role = role;
        this.user = user;
    }
}