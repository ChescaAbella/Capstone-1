package com.capstone.service;

import com.capstone.model.EmailVerificationToken;
import com.capstone.model.User;
import com.capstone.repository.EmailVerificationTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class EmailVerificationService {
    
    @Autowired
    private EmailVerificationTokenRepository tokenRepository;
    
    @Autowired
    private UserService userService;
    
    @Value("${app.frontend-url}")
    private String frontendUrl;
    
    /**
     * Create verification token for user
     */
    @Transactional
    public EmailVerificationToken createVerificationToken(User user) {
        EmailVerificationToken token = new EmailVerificationToken();
        token.setUser(user);
        return tokenRepository.save(token);
    }
    
    /**
     * Verify email using token
     */
    @Transactional
    public boolean verifyEmail(String tokenString) {
        var token = tokenRepository.findByToken(tokenString)
                .orElseThrow(() -> new RuntimeException("Invalid verification token"));
        
        if (token.isExpired()) {
            throw new RuntimeException("Verification token has expired");
        }
        
        if (token.isVerified()) {
            throw new RuntimeException("Email already verified");
        }
        
        // Mark token as verified
        token.setVerifiedAt(LocalDateTime.now());
        tokenRepository.save(token);
        
        // Mark user as verified
        User user = token.getUser();
        user.setEmailVerified(true);
        userService.saveUser(user);
        
        return true;
    }
    
    /**
     * Generate verification link for email
     */
    public String generateVerificationLink(EmailVerificationToken token) {
        return frontendUrl + "/verify-email?token=" + token.getToken();
    }
    
    /**
     * Get verification token for user
     */
    public EmailVerificationToken getVerificationToken(Long userId) {
        return tokenRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("No verification token found for user"));
    }
    
    /**
     * Resend verification email (create new token)
     */
    @Transactional
    public EmailVerificationToken resendVerificationToken(Long userId) {
        User user = userService.findById(userId);
        
        // Delete old token if exists
        tokenRepository.findByUserId(userId).ifPresent(tokenRepository::delete);
        
        // Create new token
        return createVerificationToken(user);
    }
}
