package com.cit.submit.repository;

import com.cit.submit.model.StudentSubmission;
import com.cit.submit.model.Submission;
import com.cit.submit.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentSubmissionRepository extends JpaRepository<StudentSubmission, Long> {
    Optional<StudentSubmission> findBySubmissionAndStudent(Submission submission, User student);

    List<StudentSubmission> findBySubmissionOrderBySubmittedAtDesc(Submission submission);

    List<StudentSubmission> findByStudentOrderBySubmittedAtDesc(User student);

    List<StudentSubmission> findBySubmissionIdAndSubmissionStatusOrderBySubmittedAtDesc(
            Long submissionId, String status);

    List<StudentSubmission> findByStudentIdAndSubmissionIdIn(Long studentId, List<Long> submissionIds);

    long countBySubmissionIdAndSubmissionStatus(Long submissionId, String status);
}
