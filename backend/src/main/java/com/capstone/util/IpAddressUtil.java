package com.capstone.util;

import jakarta.servlet.http.HttpServletRequest;

public class IpAddressUtil {
    
    public static String getClientIpAddress(HttpServletRequest request) {
        // Try to get IP from common proxy headers first
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // X-Forwarded-For can contain multiple IPs, get the first one
            return xForwardedFor.split(",")[0].trim();
        }

        String xForwardedHost = request.getHeader("X-Forwarded-Host");
        if (xForwardedHost != null && !xForwardedHost.isEmpty()) {
            return xForwardedHost;
        }

        String xForwardedProto = request.getHeader("X-Forwarded-Proto");
        if (xForwardedProto != null && !xForwardedProto.isEmpty()) {
            return xForwardedProto;
        }

        // Fall back to remote address
        String ipAddress = request.getHeader("X-Real-IP");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = request.getRemoteAddr();
        }

        return ipAddress;
    }
}
