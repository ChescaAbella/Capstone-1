package com.cit.submit.controller;

import com.cit.submit.dto.StudentImportResponse;
import com.cit.submit.dto.ErrorResponse;
import com.cit.submit.service.StudentImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/student-imports")
@CrossOrigin(origins = "*")
public class StudentImportController {

    @Autowired
    private StudentImportService studentImportService;

    /**
     * Upload Excel file with student data
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadStudentExcel(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("X-User-Id") Long userId) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("File is empty"));
            }

            // Validate file type
            String originalFilename = file.getOriginalFilename();
            if (!originalFilename.endsWith(".xlsx") && !originalFilename.endsWith(".xls")) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Only Excel files (.xlsx, .xls) are allowed"));
            }

            Map<String, Object> result = studentImportService.importStudentsFromExcel(file, userId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Get all imported students for the admin
     */
    @GetMapping
    public ResponseEntity<?> getImportedStudents(@RequestHeader("X-User-Id") Long userId) {
        try {
            List<StudentImportResponse> students = studentImportService.getImportedStudents(userId);
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Get specific import batch
     */
    @GetMapping("/batch/{batchId}")
    public ResponseEntity<?> getImportBatch(
            @PathVariable String batchId,
            @RequestHeader("X-User-Id") Long userId) {
        try {
            List<StudentImportResponse> students = studentImportService.getImportBatch(batchId, userId);
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Delete entire import batch
     */
    @DeleteMapping("/batch/{batchId}")
    public ResponseEntity<?> deleteImportBatch(
            @PathVariable String batchId,
            @RequestHeader("X-User-Id") Long userId) {
        try {
            studentImportService.deleteImportBatch(batchId, userId);
            return ResponseEntity.ok(new SuccessResponse("Batch deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(403).body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Delete single imported student
     */
    @DeleteMapping("/{studentImportId}")
    public ResponseEntity<?> deleteStudent(
            @PathVariable Long studentImportId,
            @RequestHeader("X-User-Id") Long userId) {
        try {
            studentImportService.deleteStudent(studentImportId, userId);
            return ResponseEntity.ok(new SuccessResponse("Student removed from import"));
        } catch (Exception e) {
            return ResponseEntity.status(403).body(new ErrorResponse(e.getMessage()));
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
