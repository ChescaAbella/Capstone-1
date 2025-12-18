package com.cit.submit.service;

import java.util.Arrays;
import java.util.List;

public class EmailValidationService {

    // List of allowed institutional email domains
    private static final List<String> ALLOWED_DOMAINS = Arrays.asList(
        "school.edu",
        "university.edu",
        "cit.edu",
        "citc.edu.ph",
        "ateneo.edu",
        "dlsu.edu.ph",
        "upd.edu.ph"
    );

    public static boolean isValidInstitutionalEmail(String email) {
        if (email == null || !email.contains("@")) {
            return false;
        }

        String domain = email.substring(email.indexOf("@") + 1).toLowerCase();
        return ALLOWED_DOMAINS.stream()
                .anyMatch(allowedDomain -> domain.equals(allowedDomain) || domain.endsWith("." + allowedDomain));
    }

    public static String getDomain(String email) {
        if (email == null || !email.contains("@")) {
            return null;
        }
        return email.substring(email.indexOf("@") + 1).toLowerCase();
    }
}
