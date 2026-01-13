package com.capstone.controller;

import com.capstone.dto.*;
import com.capstone.exception.TokenRefreshException;
import com.capstone.model.RefreshToken;
import com.capstone.model.User;
import com.capstone.model.EmailVerificationToken;
import com.capstone.security.JwtUtil;
import com.capstone.service.RefreshTokenService;
import com.capstone.service.UserService;
import com.capstone.service.EmailVerificationService;
import com.capstone.service.LoginAuditLogService;
import com.capstone.util.IpAddressUtil;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "https://capstonecg-1.vercel.app"}, allowCredentials = "true")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private EmailVerificationService emailVerificationService;

    @Autowired
    private LoginAuditLogService loginAuditLogService;

    // ===== NEW ENDPOINTS FOR EMAIL/PASSWORD AUTH =====
    
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        try {
            User user = userService.registerUser(signupRequest);
            
            // Generate tokens
            String accessToken = jwtUtil.generateTokenFromEmail(user.getEmail());
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
            
            UserInfo userInfo = new UserInfo(
                    user.getId(),
                    user.getEmail(),
                    user.getName(),
                    user.getPicture(),
                    user.getRole().name()
            );
            
            return ResponseEntity.ok(new AuthResponse(
                    accessToken,
                    refreshToken.getToken(),
                    user.getRole().name(),
                    userInfo
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        String ipAddress = IpAddressUtil.getClientIpAddress(request);
        String userAgent = request.getHeader("User-Agent");

        try {
            User user = userService.authenticateUser(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
            );
            
            // Log successful login
            loginAuditLogService.logSuccessfulLogin(
                    user.getId(),
                    user.getEmail(),
                    ipAddress,
                    userAgent,
                    "EMAIL_PASSWORD"
            );
            
            // Generate tokens
            String accessToken = jwtUtil.generateTokenFromEmail(user.getEmail());
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
            
            UserInfo userInfo = new UserInfo(
                    user.getId(),
                    user.getEmail(),
                    user.getName(),
                    user.getPicture(),
                    user.getRole().name()
            );
            
            return ResponseEntity.ok(new AuthResponse(
                    accessToken,
                    refreshToken.getToken(),
                    user.getRole().name(),
                    userInfo
            ));
        } catch (RuntimeException e) {
            // Log failed login
            loginAuditLogService.logFailedLogin(
                    loginRequest.getEmail(),
                    ipAddress,
                    userAgent,
                    e.getMessage()
            );
            
            return ResponseEntity.status(401)
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    // ===== EXISTING ENDPOINTS =====

    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(new MessageResponse("Unauthorized"));
        }

        UserInfo userInfo = new UserInfo(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getPicture(),
                user.getRole().name()
        );

        return ResponseEntity.ok(userInfo);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtUtil.generateTokenFromEmail(user.getEmail());
                    return ResponseEntity.ok(new AuthResponse(
                            token,
                            requestRefreshToken,
                            user.getRole().name(),
                            new UserInfo(
                                    user.getId(),
                                    user.getEmail(),
                                    user.getName(),
                                    user.getPicture(),
                                    user.getRole().name()
                            )
                    ));
                })
                .orElseThrow(() -> new TokenRefreshException(requestRefreshToken,
                        "Refresh token is not in database!"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(@AuthenticationPrincipal User user) {
        if (user != null) {
            refreshTokenService.deleteByUserId(user.getId());
        }
        return ResponseEntity.ok(new MessageResponse("Logged out successfully!"));
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                if (jwtUtil.validateJwtToken(token)) {
                    String email = jwtUtil.getEmailFromJwtToken(token);
                    return userService.findByEmail(email)
                            .map(user -> ResponseEntity.ok(new MessageResponse("Token is valid")))
                            .orElse(ResponseEntity.status(401)
                                    .body(new MessageResponse("User not found")));
                }
            }
            return ResponseEntity.status(401).body(new MessageResponse("Invalid token"));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(new MessageResponse("Token validation failed"));
        }
    }

    @PostMapping("/update-role")
    public ResponseEntity<?> updateRole(@RequestParam String email, 
                                        @RequestParam String role) {
        try {
            User.Role userRole = User.Role.valueOf(role.toUpperCase());
            User user = userService.updateUserRole(email, userRole);
            return ResponseEntity.ok(new UserInfo(
                    user.getId(),
                    user.getEmail(),
                    user.getName(),
                    user.getPicture(),
                    user.getRole().name()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Invalid role: " + role));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    // ===== EMAIL VERIFICATION ENDPOINTS =====

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        try {
            emailVerificationService.verifyEmail(token);
            return ResponseEntity.ok(new MessageResponse("Email verified successfully!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestParam(required = false) String email,
                                                 @AuthenticationPrincipal User user) {
        try {
            User targetUser = null;
            
            // Use authenticated user if available, otherwise use email parameter
            if (user != null) {
                targetUser = user;
            } else if (email != null && !email.isEmpty()) {
                targetUser = userService.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("User not found"));
            } else {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Either authentication or email parameter is required"));
            }
            
            EmailVerificationToken token = emailVerificationService.resendVerificationToken(targetUser.getId());
            String verificationLink = emailVerificationService.generateVerificationLink(token);
            
            // In production, send email here
            // For now, return the link in response (frontend should copy link or mock email)
            return ResponseEntity.ok(new MessageResponse(
                    "Verification email sent! Link: " + verificationLink
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/verification-status")
    public ResponseEntity<?> getVerificationStatus(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(new MessageResponse("Unauthorized"));
        }

        return ResponseEntity.ok(new MessageResponse(
                user.isEmailVerified() ? "Email verified" : "Email not verified"
        ));
    }
}