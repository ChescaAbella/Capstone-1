package com.capstone.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String name;
    
    // Password field - nullable because OAuth users won't have passwords
    @Column(name = "password_hash")
    private String passwordHash;
    
    private String picture;
    
    // Profile fields
    @Column(name = "phone_number")
    private String phoneNumber;
    
    @Column(name = "department")
    private String department;
    
    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;
    
    @Column(name = "student_id")
    private String studentId;
    
    @Column(name = "year_level")
    private String yearLevel;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.MEMBER;
    
    // Track authentication provider
    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider", nullable = false)
    private AuthProvider authProvider = AuthProvider.LOCAL;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "last_login")
    private LocalDateTime lastLogin;
    
    // Email verification for local signups
    @Column(name = "email_verified")
    private boolean emailVerified = false;
    
    // Active status for soft delete
    @Column(name = "active", nullable = false, columnDefinition = "boolean default true")
    private boolean active = true;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastLogin = LocalDateTime.now();
        if (!emailVerified && authProvider == AuthProvider.GOOGLE) {
            emailVerified = true; // Google users are pre-verified
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        lastLogin = LocalDateTime.now();
    }
    
    public enum Role {
        MEMBER, MANAGER, ADMIN
    }
    
    public enum AuthProvider {
        LOCAL,  // Email/Password
        GOOGLE  // Google OAuth
    }
}