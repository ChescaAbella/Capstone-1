package com.capstone.service;

import com.capstone.model.User;
import com.capstone.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Get all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Get user by ID
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    // Create new user (Admin action)
    @Transactional
    public User createUser(String email, String name, String password, User.Role role) {
        String normalizedEmail = email.toLowerCase();

        // Check if user already exists
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new RuntimeException("Email is already registered");
        }

        // Create new user
        User newUser = new User();
        newUser.setEmail(normalizedEmail);
        newUser.setName(name);
        newUser.setPasswordHash(passwordEncoder.encode(password));
        newUser.setRole(role);
        newUser.setAuthProvider(User.AuthProvider.LOCAL);
        newUser.setEmailVerified(true); // Admin-created users are pre-verified
        newUser.setActive(true);

        return userRepository.save(newUser);
    }

    // Update user details
    @Transactional
    public User updateUser(Long id, String name, String email, User.Role role) {
        User user = getUserById(id);

        if (name != null && !name.trim().isEmpty()) {
            user.setName(name);
        }

        if (email != null && !email.trim().isEmpty()) {
            String normalizedEmail = email.toLowerCase();
            // Check if new email is already taken by another user
            if (!user.getEmail().equals(normalizedEmail) && userRepository.existsByEmail(normalizedEmail)) {
                throw new RuntimeException("Email is already in use by another user");
            }
            user.setEmail(normalizedEmail);
        }

        if (role != null) {
            user.setRole(role);
        }

        return userRepository.save(user);
    }

    // Update user role only
    @Transactional
    public User updateUserRole(Long id, User.Role role) {
        User user = getUserById(id);
        user.setRole(role);
        return userRepository.save(user);
    }

    // Toggle user active status (soft delete/activate)
    @Transactional
    public User toggleUserStatus(Long id) {
        User user = getUserById(id);
        user.setActive(!user.isActive());
        return userRepository.save(user);
    }

    // Delete user (hard delete)
    @Transactional
    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }

    // Search users by name or email
    public List<User> searchUsers(String query) {
        String lowerQuery = query.toLowerCase();
        List<User> allUsers = userRepository.findAll();
        
        return allUsers.stream()
                .filter(user -> 
                    user.getName().toLowerCase().contains(lowerQuery) ||
                    user.getEmail().toLowerCase().contains(lowerQuery)
                )
                .collect(Collectors.toList());
    }
}
