package com.capstone.controller;

import com.capstone.dto.*;
import com.capstone.exception.TokenRefreshException;
import com.capstone.model.RefreshToken;
import com.capstone.model.User;
import com.capstone.security.JwtUtil;
import com.capstone.service.RefreshTokenService;
import com.capstone.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @Autowired
    private RefreshTokenService refreshTokenService;

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

    // Admin endpoint to update user roles (for testing)
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
}