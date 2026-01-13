package com.capstone.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "email_verification_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailVerificationToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String token;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;
    
    @PrePersist
    protected void onCreate() {
        token = UUID.randomUUID().toString();
        createdAt = LocalDateTime.now();
        // Token expires in 24 hours
        expiryDate = LocalDateTime.now().plusHours(24);
    }
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }
    
    public boolean isVerified() {
        return verifiedAt != null;
    }
}
