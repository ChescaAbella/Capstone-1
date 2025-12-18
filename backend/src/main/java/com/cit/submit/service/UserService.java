package com.cit.submit.service;

import com.cit.submit.dto.UserProfileRequest;
import com.cit.submit.dto.UserProfileResponse;
import com.cit.submit.model.User;
import com.cit.submit.model.UserRole;
import com.cit.submit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public UserProfileResponse getUserProfile(Long userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().toString(),
                user.getStudentId(),
                user.getTeamCode(),
                user.getPictureUrl()
        );
    }

    public UserProfileResponse updateUserProfile(Long userId, UserProfileRequest request) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        // Validate name
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            if (request.getName().length() < 2) {
                throw new Exception("Name must be at least 2 characters");
            }
            user.setName(request.getName());
        } else {
            throw new Exception("Name is required");
        }

        // Update optional fields based on role
        if (user.getRole() == UserRole.MEMBER) {
            if (request.getStudentId() != null) {
                user.setStudentId(request.getStudentId());
            }
            if (request.getTeamCode() != null) {
                user.setTeamCode(request.getTeamCode());
            }
        } else if (user.getRole() == UserRole.MANAGER || user.getRole() == UserRole.ADMIN) {
            if (request.getDepartment() != null) {
                user.setDepartment(request.getDepartment());
            }
            if (request.getFacultyId() != null) {
                user.setFacultyId(request.getFacultyId());
            }
        }

        if (request.getPictureUrl() != null) {
            // Validate URL format (basic validation)
            if (!request.getPictureUrl().isEmpty() && !isValidUrl(request.getPictureUrl())) {
                throw new Exception("Invalid photo URL format");
            }
            user.setPictureUrl(request.getPictureUrl());
        }

        user = userRepository.save(user);

        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().toString(),
                user.getStudentId(),
                user.getTeamCode(),
                user.getPictureUrl()
        );
    }

    private boolean isValidUrl(String url) {
        try {
            new java.net.URL(url).toURI();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
