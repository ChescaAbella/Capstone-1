package com.cit.submit.service;

import com.cit.submit.dto.UserAdminRequest;
import com.cit.submit.dto.UserAdminResponse;
import com.cit.submit.dto.AuditLogResponse;
import com.cit.submit.model.User;
import com.cit.submit.model.UserRole;
import com.cit.submit.model.AuditLog;
import com.cit.submit.repository.UserRepository;
import com.cit.submit.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    // Verify if user is admin
    public boolean isAdmin(Long userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));
        return user.getRole() == UserRole.ADMIN;
    }

    // Get all users
    public List<UserAdminResponse> getAllUsers(Long adminId) throws Exception {
        if (!isAdmin(adminId)) {
            throw new Exception("Access denied: Only admins can view users");
        }

        return userRepository.findAll().stream()
                .map(this::convertToAdminResponse)
                .collect(Collectors.toList());
    }

    // Get user details
    public UserAdminResponse getUserById(Long userId, Long adminId) throws Exception {
        if (!isAdmin(adminId)) {
            throw new Exception("Access denied: Only admins can view users");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));
        return convertToAdminResponse(user);
    }

    // Create new user (admin only)
    public UserAdminResponse createUser(UserAdminRequest request, Long adminId) throws Exception {
        if (!isAdmin(adminId)) {
            throw new Exception("Access denied: Only admins can create users");
        }

        // Validate email
        if (!EmailValidationService.isValidInstitutionalEmail(request.getEmail())) {
            throw new Exception("Invalid institutional email domain");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new Exception("Email already registered");
        }

        // Validate role
        if (request.getRole() == null) {
            throw new Exception("Role is required");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());
        user.setPasswordHash(request.getPasswordHash());
        
        // Set role-specific ID
        if (request.getRole() == UserRole.MEMBER) {
            user.setStudentId(request.getStudentId());
            user.setTeamCode(request.getTeamCode());
        } else if (request.getRole() == UserRole.MANAGER || request.getRole() == UserRole.ADMIN) {
            user.setFacultyId(request.getFacultyId());
            user.setDepartment(request.getDepartment());
        }
        
        user.setActive(true);
        user.setEmailVerified(true); // Admin-created accounts are pre-verified

        user = userRepository.save(user);

        // Log the action
        logAuditEvent(adminId, user.getId(), "CREATE", 
                "Created user: " + user.getEmail() + " with role: " + user.getRole(), null);

        return convertToAdminResponse(user);
    }

    // Update user (admin only)
    public UserAdminResponse updateUser(Long userId, UserAdminRequest request, Long adminId) throws Exception {
        if (!isAdmin(adminId)) {
            throw new Exception("Access denied: Only admins can update users");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        StringBuilder changedFields = new StringBuilder();

        // Update name
        if (request.getName() != null && !request.getName().equals(user.getName())) {
            changedFields.append("name: ").append(user.getName()).append(" -> ").append(request.getName()).append("; ");
            user.setName(request.getName());
        }

        // Update role
        if (request.getRole() != null && !request.getRole().equals(user.getRole())) {
            changedFields.append("role: ").append(user.getRole()).append(" -> ").append(request.getRole()).append("; ");
            user.setRole(request.getRole());
        }

        // Update role-specific ID
        if (request.getRole() == UserRole.MEMBER) {
            if (request.getStudentId() != null && !request.getStudentId().equals(user.getStudentId())) {
                changedFields.append("studentId: ").append(user.getStudentId()).append(" -> ").append(request.getStudentId()).append("; ");
                user.setStudentId(request.getStudentId());
            }
            if (request.getTeamCode() != null && !request.getTeamCode().equals(user.getTeamCode())) {
                changedFields.append("teamCode: ").append(user.getTeamCode()).append(" -> ").append(request.getTeamCode()).append("; ");
                user.setTeamCode(request.getTeamCode());
            }
        } else if (request.getRole() == UserRole.MANAGER || request.getRole() == UserRole.ADMIN) {
            if (request.getFacultyId() != null && !request.getFacultyId().equals(user.getFacultyId())) {
                changedFields.append("facultyId: ").append(user.getFacultyId()).append(" -> ").append(request.getFacultyId()).append("; ");
                user.setFacultyId(request.getFacultyId());
            }
            if (request.getDepartment() != null && !request.getDepartment().equals(user.getDepartment())) {
                changedFields.append("department: ").append(user.getDepartment()).append(" -> ").append(request.getDepartment()).append("; ");
                user.setDepartment(request.getDepartment());
            }
        }

        // Update active status
        if (request.getActive() != null && !request.getActive().equals(user.getActive())) {
            changedFields.append("active: ").append(user.getActive()).append(" -> ").append(request.getActive()).append("; ");
            user.setActive(request.getActive());
        }

        user = userRepository.save(user);

        // Log the action
        logAuditEvent(adminId, userId, "UPDATE", 
                "Updated user: " + user.getEmail(), changedFields.toString());

        return convertToAdminResponse(user);
    }

    // Change user role
    public UserAdminResponse changeRole(Long userId, UserRole newRole, Long adminId) throws Exception {
        if (!isAdmin(adminId)) {
            throw new Exception("Access denied: Only admins can change roles");
        }

        if (newRole == null) {
            throw new Exception("Invalid role");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        UserRole oldRole = user.getRole();
        user.setRole(newRole);
        user = userRepository.save(user);

        // Log the action
        logAuditEvent(adminId, userId, "ROLE_CHANGE", 
                "Changed role for: " + user.getEmail(), 
                "role: " + oldRole + " -> " + newRole);

        return convertToAdminResponse(user);
    }

    // Deactivate user
    public UserAdminResponse deactivateUser(Long userId, Long adminId) throws Exception {
        if (!isAdmin(adminId)) {
            throw new Exception("Access denied: Only admins can deactivate users");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        if (!user.getActive()) {
            throw new Exception("User is already deactivated");
        }

        user.setActive(false);
        user.setAccountStatus("DEACTIVATED");
        user = userRepository.save(user);

        // Log the action
        logAuditEvent(adminId, userId, "DEACTIVATE", 
                "Deactivated user: " + user.getEmail(), null);

        return convertToAdminResponse(user);
    }

    // Reactivate user
    public UserAdminResponse reactivateUser(Long userId, Long adminId) throws Exception {
        if (!isAdmin(adminId)) {
            throw new Exception("Access denied: Only admins can reactivate users");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        if (user.getActive()) {
            throw new Exception("User is already active");
        }

        user.setActive(true);
        user.setAccountStatus("ACTIVE");
        user = userRepository.save(user);

        // Log the action
        logAuditEvent(adminId, userId, "REACTIVATE", 
                "Reactivated user: " + user.getEmail(), null);

        return convertToAdminResponse(user);
    }

    // Get audit logs
    public List<AuditLogResponse> getAuditLogs(Long adminId) throws Exception {
        if (!isAdmin(adminId)) {
            throw new Exception("Access denied: Only admins can view audit logs");
        }

        return auditLogRepository.findAll().stream()
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .map(this::convertToAuditLogResponse)
                .collect(Collectors.toList());
    }

    // Get audit logs for specific user
    public List<AuditLogResponse> getAuditLogsForUser(Long userId, Long adminId) throws Exception {
        if (!isAdmin(adminId)) {
            throw new Exception("Access denied: Only admins can view audit logs");
        }

        return auditLogRepository.findByTargetUserIdOrderByTimestampDesc(userId).stream()
                .map(this::convertToAuditLogResponse)
                .collect(Collectors.toList());
    }

    // Helper methods
    private void logAuditEvent(Long adminId, Long targetUserId, String action, String description, String changedFields) {
        AuditLog log = new AuditLog();
        log.setAdminId(adminId);
        log.setTargetUserId(targetUserId);
        log.setAction(action);
        log.setDescription(description);
        log.setChangedFields(changedFields);
        log.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(log);
    }

    private UserAdminResponse convertToAdminResponse(User user) {
        UserAdminResponse response = new UserAdminResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        
        // Set role-specific ID based on role
        if (user.getRole() == UserRole.MEMBER) {
            response.setStudentId(user.getStudentId());
            response.setTeamCode(user.getTeamCode());
        } else if (user.getRole() == UserRole.MANAGER || user.getRole() == UserRole.ADMIN) {
            response.setFacultyId(user.getFacultyId());
            response.setDepartment(user.getDepartment());
        }
        
        response.setActive(user.getActive());
        response.setEmailVerified(user.getEmailVerified());
        response.setIsProfileComplete(user.getIsProfileComplete());
        response.setAccountStatus(user.getAccountStatus());
        response.setCreatedAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        response.setApprovedAt(user.getApprovedAt() != null ? user.getApprovedAt().toString() : null);
        
        return response;
    }

    private AuditLogResponse convertToAuditLogResponse(AuditLog log) {
        User admin = userRepository.findById(log.getAdminId()).orElse(null);
        User targetUser = userRepository.findById(log.getTargetUserId()).orElse(null);

        return new AuditLogResponse(
                log.getId(),
                log.getAdminId(),
                admin != null ? admin.getName() : "Unknown",
                log.getTargetUserId(),
                targetUser != null ? targetUser.getEmail() : "Unknown",
                log.getAction(),
                log.getDescription(),
                log.getChangedFields(),
                log.getTimestamp()
        );
    }
}
