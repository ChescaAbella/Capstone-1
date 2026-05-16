package com.cit.submit.service;

import com.cit.submit.dto.CreateSubmissionRequest;
import com.cit.submit.dto.SubmissionResponse;
import com.cit.submit.dto.StudentSubmissionResponse;
import com.cit.submit.model.Submission;
import com.cit.submit.model.StudentSubmission;
import com.cit.submit.model.User;
import com.cit.submit.model.UserRole;
import com.cit.submit.repository.SubmissionRepository;
import com.cit.submit.repository.StudentSubmissionRepository;
import com.cit.submit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubmissionService {

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private StudentSubmissionRepository studentSubmissionRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Create a new submission (only for TEACHER/ADMIN)
     */
    public SubmissionResponse createSubmission(CreateSubmissionRequest request, Long userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        if (!isManagerOrAdmin(user)) {
            throw new Exception("Only teachers and admins can create submissions");
        }

        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new Exception("Title is required");
        }

        if (request.getDueDate() == null) {
            throw new Exception("Due date is required");
        }

        if (request.getDueDate().isBefore(LocalDateTime.now())) {
            throw new Exception("Due date must be in the future");
        }

        Submission submission = new Submission();
        submission.setTitle(request.getTitle());
        submission.setDescription(request.getDescription());
        submission.setDueDate(request.getDueDate());
        submission.setCreatedBy(user);
        submission.setSubmissionType(request.getSubmissionType() != null ? request.getSubmissionType() : "INDIVIDUAL");
        submission.setTeamCode(request.getTeamCode());
        submission.setAllowLateSubmission(request.getAllowLateSubmission() != null ? request.getAllowLateSubmission() : false);
        submission.setMaxFileSizeMb(request.getMaxFileSizeMb() != null ? request.getMaxFileSizeMb() : 50);
        submission.setAllowedFileTypes(request.getAllowedFileTypes() != null ? request.getAllowedFileTypes() : "pdf,doc,docx,xlsx,xls,txt,zip,pptx");
        submission.setIsPublished(request.getIsPublished() != null ? request.getIsPublished() : false);

        submission = submissionRepository.save(submission);

        // If published, create student submissions for all eligible students
        if (submission.getIsPublished()) {
            createStudentSubmissions(submission);
        }

        return buildSubmissionResponse(submission);
    }

    /**
     * Update submission
     */
    public SubmissionResponse updateSubmission(Long submissionId, CreateSubmissionRequest request, Long userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new Exception("Submission not found"));

        if (!submission.getCreatedBy().getId().equals(userId) && !isAdmin(user)) {
            throw new Exception("You don't have permission to update this submission");
        }

        submission.setTitle(request.getTitle());
        submission.setDescription(request.getDescription());
        submission.setSubmissionType(request.getSubmissionType());
        submission.setTeamCode(request.getTeamCode());
        submission.setAllowLateSubmission(request.getAllowLateSubmission());
        submission.setMaxFileSizeMb(request.getMaxFileSizeMb());
        submission.setAllowedFileTypes(request.getAllowedFileTypes());

        // If publishing for first time, create student submissions
        if (!submission.getIsPublished() && request.getIsPublished()) {
            submission.setIsPublished(true);
            submission = submissionRepository.save(submission);
            createStudentSubmissions(submission);
        } else {
            submission.setIsPublished(request.getIsPublished());
            submission = submissionRepository.save(submission);
        }

        return buildSubmissionResponse(submission);
    }

    /**
     * Get all submissions created by the user
     */
    public List<SubmissionResponse> getMySubmissions(Long userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        List<Submission> submissions = submissionRepository.findByCreatedByIdOrderByCreatedAtDesc(userId);

        return submissions.stream()
                .map(this::buildSubmissionResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all published submissions for students
     */
    public List<SubmissionResponse> getPublishedSubmissions(Long userId) throws Exception {
        User student = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        // Get all published submissions, then filter by team if applicable
        List<Submission> submissions = submissionRepository.findByIsPublishedTrue();

        return submissions.stream()
                .filter(s -> s.getTeamCode() == null || s.getTeamCode().equals(student.getTeamCode()))
                .map(this::buildSubmissionResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get single submission with stats
     */
    public SubmissionResponse getSubmission(Long submissionId, Long userId) throws Exception {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new Exception("Submission not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        // Check permissions
        if (!submission.getIsPublished() && !submission.getCreatedBy().getId().equals(userId) && !isAdmin(user)) {
            throw new Exception("You don't have permission to view this submission");
        }

        return buildSubmissionResponse(submission);
    }

    /**
     * Delete submission
     */
    public void deleteSubmission(Long submissionId, Long userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new Exception("Submission not found"));

        if (!submission.getCreatedBy().getId().equals(userId) && !isAdmin(user)) {
            throw new Exception("You don't have permission to delete this submission");
        }

        // Delete all student submissions first
        List<StudentSubmission> studentSubmissions = studentSubmissionRepository.findBySubmissionOrderBySubmittedAtDesc(submission);
        studentSubmissionRepository.deleteAll(studentSubmissions);

        submissionRepository.deleteById(submissionId);
    }

    /**
     * Publish submission
     */
    public SubmissionResponse publishSubmission(Long submissionId, Long userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new Exception("Submission not found"));

        if (!submission.getCreatedBy().getId().equals(userId) && !isAdmin(user)) {
            throw new Exception("You don't have permission to publish this submission");
        }

        if (submission.getIsPublished()) {
            throw new Exception("Submission is already published");
        }

        submission.setIsPublished(true);
        submission = submissionRepository.save(submission);

        // Create student submissions
        createStudentSubmissions(submission);

        return buildSubmissionResponse(submission);
    }

    /**
     * Get submissions for a specific team
     */
    public List<SubmissionResponse> getSubmissionsForTeam(String teamCode) throws Exception {
        List<Submission> submissions = submissionRepository.findByTeamCodeOrderByCreatedAtDesc(teamCode);
        return submissions.stream()
                .map(this::buildSubmissionResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all student submissions for a specific submission
     */
    public List<StudentSubmissionResponse> getStudentSubmissions(Long submissionId, Long userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new Exception("Submission not found"));

        if (!submission.getCreatedBy().getId().equals(userId) && !isAdmin(user)) {
            throw new Exception("You don't have permission to view these submissions");
        }

        List<StudentSubmission> studentSubmissions = studentSubmissionRepository.findBySubmissionOrderBySubmittedAtDesc(submission);
        return studentSubmissions.stream()
                .map(StudentSubmissionResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Grade a student submission
     */
    public StudentSubmissionResponse gradeSubmission(Long studentSubmissionId, Double grade, String feedback, Long userId) throws Exception {
        User grader = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        if (!isManagerOrAdmin(grader)) {
            throw new Exception("Only teachers and admins can grade submissions");
        }

        StudentSubmission ss = studentSubmissionRepository.findById(studentSubmissionId)
                .orElseThrow(() -> new Exception("Student submission not found"));

        if (grade < 0 || grade > 100) {
            throw new Exception("Grade must be between 0 and 100");
        }

        ss.setGrade(grade);
        ss.setFeedback(feedback);
        ss.setGradedAt(LocalDateTime.now());
        ss.setGradedByUserId(userId);
        ss.setSubmissionStatus("GRADED");

        ss = studentSubmissionRepository.save(ss);
        return new StudentSubmissionResponse(ss);
    }

    /**
     * Helper methods
     */
    private void createStudentSubmissions(Submission submission) {
        List<User> students;

        if (submission.getTeamCode() != null) {
            // Get students from specific team
            students = userRepository.findAll().stream()
                    .filter(u -> submission.getTeamCode().equals(u.getTeamCode()) && u.getRole().toString().equals("STUDENT"))
                    .collect(Collectors.toList());
        } else {
            // Get all students
            students = userRepository.findAll().stream()
                    .filter(u -> u.getRole().toString().equals("STUDENT"))
                    .collect(Collectors.toList());
        }

        for (User student : students) {
            // Check if entry already exists
            if (studentSubmissionRepository.findBySubmissionAndStudent(submission, student).isEmpty()) {
                StudentSubmission ss = new StudentSubmission();
                ss.setSubmission(submission);
                ss.setStudent(student);
                ss.setSubmissionStatus("NOT_SUBMITTED");
                studentSubmissionRepository.save(ss);
            }
        }
    }

    private SubmissionResponse buildSubmissionResponse(Submission submission) {
        SubmissionResponse response = new SubmissionResponse(submission);

        // Calculate stats
        long totalStudents = studentSubmissionRepository.findBySubmissionOrderBySubmittedAtDesc(submission).size();
        long submittedCount = studentSubmissionRepository.countBySubmissionIdAndSubmissionStatus(submission.getId(), "SUBMITTED");
        long gradedCount = studentSubmissionRepository.countBySubmissionIdAndSubmissionStatus(submission.getId(), "GRADED");

        response.setTotalStudents(totalStudents);
        response.setSubmittedCount(submittedCount);
        response.setGradedCount(gradedCount);

        return response;
    }

    private boolean isManagerOrAdmin(User user) {
        String role = user.getRole().toString();
        return role.equals("TEACHER") || role.equals("ADMIN");
    }

    private boolean isAdmin(User user) {
        return user.getRole().toString().equals("ADMIN");
    }
}
