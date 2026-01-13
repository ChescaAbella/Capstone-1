package com.capstone.service;

import com.capstone.dto.SignupRequest;
import com.capstone.model.User;
import com.capstone.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.allowed-email-domain}")
    private String allowedEmailDomain;

    // ===== OAUTH USER CREATION/UPDATE (Google Sign-In) =====
    // Accepts ANY email domain - no restrictions for OAuth users
    @Transactional
    public User createOrUpdateUser(String email, String name, String picture) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        
        if (existingUser.isPresent()) {
            // Update existing OAuth user
            User user = existingUser.get();
            user.setName(name);
            user.setPicture(picture);
            user.setLastLogin(LocalDateTime.now());
            return userRepository.save(user);
        } else {
            // Create new OAuth user - NO EMAIL DOMAIN RESTRICTION
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setPicture(picture);
            newUser.setRole(User.Role.STUDENT); // Default role
            newUser.setAuthProvider(User.AuthProvider.GOOGLE);
            newUser.setEmailVerified(true); // Google emails are pre-verified
            return userRepository.save(newUser);
        }
    }

    // ===== EMAIL/PASSWORD SIGNUP =====
    // ONLY accepts school email domain for manual registration
    @Transactional
    public User registerUser(SignupRequest signupRequest) {
        String email = signupRequest.getEmail().toLowerCase();
        
        // STRICT VALIDATION: Only school emails can register with email/password
        if (!email.endsWith(allowedEmailDomain)) {
            throw new RuntimeException(
                "Please use a valid school email address (" + allowedEmailDomain + "). " +
                "For other email providers, please use 'Sign in with Google'."
            );
        }

        // Check if user already exists
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email is already registered");
        }

        // Validate and parse role
        User.Role role;
        try {
            role = User.Role.valueOf(signupRequest.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role. Must be STUDENT, LEADER, or ADVISER");
        }

        // Create new user with email/password
        User newUser = new User();
        newUser.setEmail(email);
        newUser.setName(signupRequest.getName());
        newUser.setPasswordHash(passwordEncoder.encode(signupRequest.getPassword()));
        newUser.setRole(role);
        newUser.setAuthProvider(User.AuthProvider.LOCAL);
        newUser.setEmailVerified(false); // Can implement email verification later
        newUser.setPicture(null); // No profile picture for local signups initially

        return userRepository.save(newUser);
    }

    // ===== EMAIL/PASSWORD LOGIN =====
    // Authenticate user for login
    @Transactional
    public User authenticateUser(String email, String password) {
        String normalizedEmail = email.toLowerCase();
        
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // Check if user registered with email/password
        if (user.getAuthProvider() != User.AuthProvider.LOCAL) {
            throw new RuntimeException(
                "This account is registered with " + user.getAuthProvider() + ". " +
                "Please sign in using 'Sign in with Google'."
            );
        }

        // Verify password
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        return userRepository.save(user);
    }

    // ===== UTILITY METHODS =====
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Transactional
    public User updateUserRole(String email, User.Role role) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        user.setRole(role);
        return userRepository.save(user);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}