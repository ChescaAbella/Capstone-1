package com.cit.submit.controller;

import com.cit.submit.dto.CreateSubmissionRequest;
import com.cit.submit.dto.SubmissionResponse;
import com.cit.submit.dto.StudentSubmissionResponse;
import com.cit.submit.dto.ErrorResponse;
import com.cit.submit.service.SubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
@CrossOrigin(origins = "*")
public class SubmissionController {

    @Autowired
    private SubmissionService submissionService;

    /**
     * Create a new submission (Teacher/Admin only)
     */
    @PostMapping
    public ResponseEntity<?> createSubmission(
            @RequestBody CreateSubmissionRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        try {
            SubmissionResponse response = submissionService.createSubmission(request, userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Update submission
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSubmission(
            @PathVariable Long id,
            @RequestBody CreateSubmissionRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        try {
            SubmissionResponse response = submissionService.updateSubmission(id, request, userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Get all submissions created by the user
     */
    @GetMapping("/my-submissions")
    public ResponseEntity<?> getMySubmissions(@RequestHeader("X-User-Id") Long userId) {
        try {
            List<SubmissionResponse> submissions = submissionService.getMySubmissions(userId);
            return ResponseEntity.ok(submissions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Get all published submissions (for students)
     */
    @GetMapping("/available")
    public ResponseEntity<?> getAvailableSubmissions(@RequestHeader("X-User-Id") Long userId) {
        try {
            List<SubmissionResponse> submissions = submissionService.getPublishedSubmissions(userId);
            return ResponseEntity.ok(submissions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Get single submission
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getSubmission(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        try {
            SubmissionResponse response = submissionService.getSubmission(id, userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Publish submission
     */
    @PostMapping("/{id}/publish")
    public ResponseEntity<?> publishSubmission(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        try {
            SubmissionResponse response = submissionService.publishSubmission(id, userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Delete submission
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSubmission(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        try {
            submissionService.deleteSubmission(id, userId);
            return ResponseEntity.ok(new SuccessResponse("Submission deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Get all student submissions for a submission
     */
    @GetMapping("/{id}/student-submissions")
    public ResponseEntity<?> getStudentSubmissions(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        try {
            List<StudentSubmissionResponse> submissions = submissionService.getStudentSubmissions(id, userId);
            return ResponseEntity.ok(submissions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Grade a student submission
     */
    @PostMapping("/student-submissions/{id}/grade")
    public ResponseEntity<?> gradeSubmission(
            @PathVariable Long id,
            @RequestParam Double grade,
            @RequestParam(required = false) String feedback,
            @RequestHeader("X-User-Id") Long userId) {
        try {
            StudentSubmissionResponse response = submissionService.gradeSubmission(id, grade, feedback, userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // Helper response classes
    public static class SuccessResponse {
        public String message;

        public SuccessResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }
    }
}
