package com.cit.submit.controller;

import com.cit.submit.dto.LoginRequest;
import com.cit.submit.dto.LoginResponse;
import com.cit.submit.dto.RegisterRequest;
import com.cit.submit.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request.getEmail(), request.getPassword());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerManual(@RequestBody RegisterRequest request) {
        try {
            LoginResponse response = authService.registerManual(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/register-oauth")
    public ResponseEntity<?> registerOAuth(@RequestBody OAuthRequest request) {
        try {
            LoginResponse response = authService.registerOAuth(
                    request.getEmail(),
                    request.getName(),
                    request.getOauthProvider()
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/verify/{token}")
    public ResponseEntity<?> verifyEmail(@PathVariable String token) {
        try {
            authService.verifyEmail(token);
            return ResponseEntity.ok(new MessageResponse("Email verified successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleAuth(@RequestBody GoogleAuthRequest request) {
        try {
            LoginResponse response = authService.authenticateWithGoogle(request.getToken());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok(new MessageResponse("Backend is working!"));
    }

    static class ErrorResponse {
        public String error;
        public ErrorResponse(String error) {
            this.error = error;
        }
    }

    static class MessageResponse {
        public String message;
        public MessageResponse(String message) {
            this.message = message;
        }
    }

    static class OAuthRequest {
        public String email;
        public String name;
        public String oauthProvider;
        public String oauthId;

        public OAuthRequest() {}

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getOauthProvider() { return oauthProvider; }
        public void setOauthProvider(String oauthProvider) { this.oauthProvider = oauthProvider; }
        public String getOauthId() { return oauthId; }
        public void setOauthId(String oauthId) { this.oauthId = oauthId; }
    }

    static class GoogleAuthRequest {
        public String token;

        public GoogleAuthRequest() {}

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
    }
}
