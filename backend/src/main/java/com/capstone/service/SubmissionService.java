package com.capstone.service;

import com.capstone.dto.SubmissionDTO;
import com.capstone.exception.ResourceNotFoundException;
import com.capstone.model.Deliverable;
import com.capstone.model.Submission;
import com.capstone.repository.DeliverableRepository;
import com.capstone.repository.SubmissionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for managing deliverable submissions
 */
@Slf4j
@Service
@Transactional
public class SubmissionService {
    
    @Autowired
    private SubmissionRepository submissionRepository;
    
    @Autowired
    private DeliverableRepository deliverableRepository;
    
    @Value("${upload.dir:uploads}")
    private String uploadDir;
    
    /**
     * Submit a file for a deliverable
     */
    public SubmissionDTO submitFile(Long deliverableId, MultipartFile file, String userId) throws IOException {
        Deliverable deliverable = deliverableRepository.findById(deliverableId)
                .orElseThrow(() -> new ResourceNotFoundException("Deliverable not found"));
        
        // Validate file
        validateFile(file);
        
        // Check if there's already a latest submission
        List<Submission> existingSubmissions = submissionRepository.findByDeliverableId(deliverableId);
        int nextVersion = existingSubmissions.size() + 1;
        
        // Mark previous latest submission as not latest
        if (!existingSubmissions.isEmpty()) {
            submissionRepository.findLatestSubmissionByDeliverableId(deliverableId)
                    .ifPresent(submission -> {
                        submission.setIsLatest(false);
                        submissionRepository.save(submission);
                    });
        }
        
        // Save file to disk
        String fileName = generateFileName(file.getOriginalFilename());
        Path uploadPath = Paths.get(uploadDir, "submissions", deliverableId.toString());
        Files.createDirectories(uploadPath);
        Path filePath = uploadPath.resolve(fileName);
        Files.write(filePath, file.getBytes());
        
        log.info("File saved to: {}", filePath);
        
        // Create submission record
        Submission submission = Submission.builder()
                .deliverable(deliverable)
                .submittedBy(userId)
                .fileName(file.getOriginalFilename())
                .filePath(filePath.toString())
                .fileSize(file.getSize())
                .fileType(file.getContentType())
                .versionNumber(nextVersion)
                .isLatest(true)
                .status("SUBMITTED")
                .build();
        
        Submission savedSubmission = submissionRepository.save(submission);
        log.info("Submission created: {} for deliverable: {} by user: {}", 
                savedSubmission.getId(), deliverableId, userId);
        
        return mapToDTO(savedSubmission);
    }
    
    /**
     * Get latest submission for a deliverable
     */
    public SubmissionDTO getLatestSubmission(Long deliverableId) {
        return submissionRepository.findLatestSubmissionByDeliverableId(deliverableId)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("No submission found"));
    }
    
    /**
     * Get all submissions for a deliverable
     */
    public List<SubmissionDTO> getSubmissionHistory(Long deliverableId) {
        return submissionRepository.findSubmissionHistory(deliverableId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get submission by ID
     */
    public SubmissionDTO getSubmissionById(Long submissionId) {
        return submissionRepository.findById(submissionId)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
    }
    
    /**
     * Update submission feedback/status (for reviewers)
     */
    public SubmissionDTO updateSubmissionStatus(Long submissionId, String status, String feedback) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
        
        submission.setStatus(status);
        submission.setFeedback(feedback);
        
        Submission updated = submissionRepository.save(submission);
        log.info("Updated submission: {} status to: {}", submissionId, status);
        
        return mapToDTO(updated);
    }
    
    /**
     * Get all submissions by a user
     */
    public List<SubmissionDTO> getUserSubmissions(String userId) {
        return submissionRepository.findBySubmittedBy(userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Validate uploaded file
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        long maxSize = 50 * 1024 * 1024; // 50MB
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("File size exceeds 50MB limit");
        }
        
        String[] allowedTypes = {
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "text/plain",
                "application/zip",
                "application/x-rar-compressed"
        };
        
        boolean isAllowed = false;
        for (String type : allowedTypes) {
            if (file.getContentType() != null && file.getContentType().equals(type)) {
                isAllowed = true;
                break;
            }
        }
        
        if (!isAllowed) {
            throw new IllegalArgumentException("File type not allowed");
        }
    }
    
    /**
     * Generate unique file name
     */
    private String generateFileName(String originalFileName) {
        String extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        return UUID.randomUUID() + extension;
    }
    
    /**
     * Map Submission to DTO
     */
    private SubmissionDTO mapToDTO(Submission submission) {
        return SubmissionDTO.builder()
                .id(submission.getId())
                .deliverableId(submission.getDeliverable().getId())
                .deliverableName(submission.getDeliverable().getName())
                .submittedBy(submission.getSubmittedBy())
                .fileName(submission.getFileName())
                .fileSize(submission.getFileSize())
                .fileType(submission.getFileType())
                .status(submission.getStatus())
                .feedback(submission.getFeedback())
                .isLatest(submission.getIsLatest())
                .versionNumber(submission.getVersionNumber())
                .createdAt(submission.getCreatedAt())
                .updatedAt(submission.getUpdatedAt())
                .build();
    }
}
