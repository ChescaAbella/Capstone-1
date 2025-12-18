package com.cit.submit.service;

import java.security.SecureRandom;
import java.util.Base64;

public class EmailService {

    public static String generateVerificationToken() {
        SecureRandom random = new SecureRandom();
        byte[] tokenBytes = new byte[24];
        random.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }

    public static String buildVerificationEmail(String userName, String verificationLink) {
        return "<!DOCTYPE html>" +
               "<html>" +
               "<head><style>" +
               "body { font-family: Arial, sans-serif; }" +
               ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
               ".button { background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }" +
               "</style></head>" +
               "<body>" +
               "<div class='container'>" +
               "<h2>Welcome to DeliverEase, " + userName + "!</h2>" +
               "<p>Please verify your email address to activate your account.</p>" +
               "<p><a href='" + verificationLink + "' class='button'>Verify Email</a></p>" +
               "<p>If you didn't create this account, please ignore this email.</p>" +
               "<p>This link expires in 24 hours.</p>" +
               "</div>" +
               "</body>" +
               "</html>";
    }

    public static String buildOAuthVerificationEmail(String userName) {
        return "<!DOCTYPE html>" +
               "<html>" +
               "<head><style>" +
               "body { font-family: Arial, sans-serif; }" +
               ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
               "</style></head>" +
               "<body>" +
               "<div class='container'>" +
               "<h2>Welcome to DeliverEase, " + userName + "!</h2>" +
               "<p>Your account has been successfully created via Google Sign-In.</p>" +
               "<p>You can now log in and start managing your deliverables.</p>" +
               "<p>Default Role: Contributor</p>" +
               "</div>" +
               "</body>" +
               "</html>";
    }
}
