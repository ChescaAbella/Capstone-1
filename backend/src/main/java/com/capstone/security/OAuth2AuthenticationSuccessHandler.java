package com.capstone.security;

import com.capstone.model.User;
import com.capstone.service.RefreshTokenService;
import com.capstone.service.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    @Lazy
    private UserService userService;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    // No need for allowedDomain check in OAuth - we accept any Google account

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, 
                                        HttpServletResponse response,
                                        Authentication authentication) 
            throws IOException, ServletException {
        
        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            String email = oAuth2User.getAttribute("email");
            String name = oAuth2User.getAttribute("name");
            String picture = oAuth2User.getAttribute("picture");

            // NO EMAIL DOMAIN VALIDATION FOR GOOGLE OAUTH
            // We accept any Google account for OAuth sign-in
            // Email/password signup will still enforce @cit.edu in UserService.java

            // Create or update user
            User user = userService.createOrUpdateUser(email, name, picture);

            // Generate tokens
            String accessToken = jwtUtil.generateTokenFromEmail(email);
            String refreshToken = refreshTokenService.createRefreshToken(user.getId()).getToken();

            // Redirect to frontend with tokens
            String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/auth/callback")
                    .queryParam("token", accessToken)
                    .queryParam("refreshToken", refreshToken)
                    .queryParam("role", user.getRole().name())
                    .build().toUriString();

            getRedirectStrategy().sendRedirect(request, response, targetUrl);
            
        } catch (Exception e) {
            e.printStackTrace();
            
            String errorUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/login")
                    .queryParam("error", "server_error")
                    .queryParam("message", "Authentication failed")
                    .build().toUriString();
            getRedirectStrategy().sendRedirect(request, response, errorUrl);
        }
    }
}