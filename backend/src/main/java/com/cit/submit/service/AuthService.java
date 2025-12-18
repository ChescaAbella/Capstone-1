package com.cit.submit.service;

import com.cit.submit.dto.LoginResponse;
import com.cit.submit.dto.RegisterRequest;
import com.cit.submit.model.User;
import com.cit.submit.model.UserRole;
import com.cit.submit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public LoginResponse login(String email, String password) throws Exception {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new Exception("User not found"));

        if (!user.getEmailVerified()) {
            throw new Exception("Email not verified. Please check your email for verification link.");
        }

        if (user.getPasswordHash() != null && !user.getPasswordHash().equals(password)) {
            throw new Exception("Invalid password");
        }

        String token = generateToken(user);

        return new LoginResponse(token, new LoginResponse.UserInfo(
                user.getId(),
                user.getEmail(),
                user.getRole().toString(),
                user.getName()
        ));
    }

    public LoginResponse registerManual(RegisterRequest request) throws Exception {
        // Validate institutional email domain
        if (!EmailValidationService.isValidInstitutionalEmail(request.getEmail())) {
            throw new Exception("Please use an institutional email address (@school.edu)");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new Exception("Email already registered");
        }

        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new Exception("Password must be at least 6 characters");
        }

        // Create unverified user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(request.getPassword());
        user.setName(request.getName());
        user.setStudentId(request.getStudentId());
        user.setTeamCode(request.getTeamCode());
        user.setRole(UserRole.MEMBER); // Default role
        user.setEmailVerified(false);
        user.setAuthProvider("email");
        user.setAccountStatus("PENDING");

        user = userRepository.save(user);

        // In production, send verification email via Gmail API
        // String verificationLink = "http://localhost:5173/verify?token=" + user.getVerificationToken();
        // sendVerificationEmail(user.getEmail(), user.getName(), verificationLink);

        return new LoginResponse(null, new LoginResponse.UserInfo(
                user.getId(),
                user.getEmail(),
                user.getRole().toString(),
                user.getName()
        ));
    }

    public LoginResponse registerOAuth(String email, String name, String oauthProvider) throws Exception {
        // Validate institutional email domain
        if (!EmailValidationService.isValidInstitutionalEmail(email)) {
            throw new Exception("Please use an institutional email address");
        }

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            // Create new user with OAuth
            user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setAuthProvider(oauthProvider);
            user.setRole(UserRole.MEMBER); // Default role
            user.setEmailVerified(true); // OAuth verified automatically
            user.setAccountStatus("ACTIVE");
            user = userRepository.save(user);
        } else if (!user.getEmailVerified()) {
            // Verify existing unverified user
            user.setEmailVerified(true);
            user.setAuthProvider(oauthProvider);
            user.setAccountStatus("ACTIVE");
            user = userRepository.save(user);
        }

        String token = generateToken(user);

        return new LoginResponse(token, new LoginResponse.UserInfo(
                user.getId(),
                user.getEmail(),
                user.getRole().toString(),
                user.getName()
        ));
    }

    public LoginResponse authenticateWithGoogle(String googleToken) throws Exception {
        try {
            // Decode the Google JWT token (already verified by Google frontend)
            // Format: header.payload.signature
            String[] parts = googleToken.split("\\.");
            if (parts.length != 3) {
                throw new Exception("Invalid token format");
            }

            // Decode the payload (second part)
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            
            // Parse JSON payload
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> tokenPayload = objectMapper.readValue(payload, Map.class);

            // Extract user information from token
            String email = (String) tokenPayload.get("email");
            String name = (String) tokenPayload.get("name");
            String picture = (String) tokenPayload.get("picture");

            if (email == null) {
                throw new Exception("Email not found in token");
            }

            // Validate institutional email
            if (!EmailValidationService.isValidInstitutionalEmail(email)) {
                throw new Exception("Please use an institutional email address");
            }

            // Check if user exists
            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                // Create new user with Google OAuth
                user = new User();
                user.setEmail(email);
                user.setName(name);
                user.setAuthProvider("google");
                user.setPictureUrl(picture);
                user.setRole(UserRole.MEMBER);
                user.setEmailVerified(true);
                user.setAccountStatus("ACTIVE");
                user.setPasswordHash(""); // OAuth users don't have password
                user = userRepository.save(user);
            } else {
                // Update existing user
                user.setAuthProvider("google");
                user.setEmailVerified(true);
                user.setAccountStatus("ACTIVE");
                if (picture != null) {
                    user.setPictureUrl(picture);
                }
                user = userRepository.save(user);
            }

            // Generate backend JWT token
            String token = generateToken(user);

            return new LoginResponse(token, new LoginResponse.UserInfo(
                    user.getId(),
                    user.getEmail(),
                    user.getRole().toString(),
                    user.getName()
            ));

        } catch (Exception e) {
            throw new Exception("Google token verification failed: " + e.getMessage());
        }
    }

    public void verifyEmail(String token) throws Exception {
        // Note: The new User model doesn't have verification token field
        // You may want to implement a separate token management service
        throw new Exception("Email verification not implemented in new model");
    }

    private String generateToken(User user) {
        String payload = user.getId() + ":" + user.getEmail() + ":" + System.currentTimeMillis();
        return Base64.getEncoder().encodeToString(payload.getBytes()) + "." + UUID.randomUUID().toString();
    }
}
