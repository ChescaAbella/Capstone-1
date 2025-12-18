package com.cit.submit.model;

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
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(nullable = false)
    private String name;

    @Column(name = "student_id", unique = true)
    private String studentId;

    @Column(name = "faculty_id", unique = true)
    private String facultyId;

    @Column(name = "team_code")
    private String teamCode;

    @Column(nullable = true)
    private String department;

    @Column(name = "auth_provider")
    private String authProvider = "email";

    @Column(name = "picture_url")
    private String pictureUrl;

    @Column(name = "is_profile_complete")
    private Boolean isProfileComplete = false;

    @Column(name = "email_verified")
    private Boolean emailVerified = false;

    @Column(name = "active")
    private Boolean active = true;

    @Column(name = "account_status")
    private String accountStatus = "PENDING";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (role == null) {
            role = UserRole.MEMBER;
        }
        if (authProvider == null) {
            authProvider = "email";
        }
        if (isProfileComplete == null) {
            isProfileComplete = false;
        }
        if (emailVerified == null) {
            emailVerified = false;
        }
        if (active == null) {
            active = true;
        }
        if (accountStatus == null) {
            accountStatus = "PENDING";
        }
    }
}
