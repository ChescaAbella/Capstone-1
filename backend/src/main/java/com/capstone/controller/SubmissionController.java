package com.capstone.controller;

import com.capstone.dto.SubmissionDTO;
import com.capstone.service.SubmissionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.List;

/**
 * Controller for submission endpoints
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/submissions")
public class SubmissionController {
    
    @Autowired
    private SubmissionService submissionService;
    
    /**
     * Submit a file for a deliverable
     */
    @PostMapping("/deliverable/{deliverableId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SubmissionDTO> submitFile(
            @PathVariable Long deliverableId,
            @RequestParam("file") MultipartFile file,
            Principal principal) throws IOException {
        log.info("Submitting file for deliverable: {} by user: {}", deliverableId, principal.getName());
        SubmissionDTO submission = submissionService.submitFile(deliverableId, file, principal.getName());
        return new ResponseEntity<>(submission, HttpStatus.CREATED);
    }
    
    /**
     * Get latest submission for a deliverable
     */
    @GetMapping("/deliverable/{deliverableId}/latest")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SubmissionDTO> getLatestSubmission(@PathVariable Long deliverableId) {
        log.info("Getting latest submission for deliverable: {}", deliverableId);
        SubmissionDTO submission = submissionService.getLatestSubmission(deliverableId);
        return new ResponseEntity<>(submission, HttpStatus.OK);
    }
    
    /**
     * Get submission history (all versions) for a deliverable
     */
    @GetMapping("/deliverable/{deliverableId}/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SubmissionDTO>> getSubmissionHistory(@PathVariable Long deliverableId) {
        log.info("Getting submission history for deliverable: {}", deliverableId);
        List<SubmissionDTO> submissions = submissionService.getSubmissionHistory(deliverableId);
        return new ResponseEntity<>(submissions, HttpStatus.OK);
    }
    
    /**
     * Get submission by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SubmissionDTO> getSubmissionById(@PathVariable Long id) {
        log.info("Getting submission: {}", id);
        SubmissionDTO submission = submissionService.getSubmissionById(id);
        return new ResponseEntity<>(submission, HttpStatus.OK);
    }
    
    /**
     * Update submission status/feedback (for managers/admins reviewing)
     */
    @PutMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<SubmissionDTO> reviewSubmission(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String feedback) {
        log.info("Reviewing submission: {} with status: {}", id, status);
        SubmissionDTO submission = submissionService.updateSubmissionStatus(id, status, feedback);
        return new ResponseEntity<>(submission, HttpStatus.OK);
    }
    
    /**
     * Get all submissions by current user
     */
    @GetMapping("/user/my-submissions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SubmissionDTO>> getUserSubmissions(Principal principal) {
        log.info("Getting submissions for user: {}", principal.getName());
        List<SubmissionDTO> submissions = submissionService.getUserSubmissions(principal.getName());
        return new ResponseEntity<>(submissions, HttpStatus.OK);
    }
}
