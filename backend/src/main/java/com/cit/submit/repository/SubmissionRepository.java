package com.cit.submit.repository;

import com.cit.submit.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByCreatedByIdOrderByCreatedAtDesc(Long userId);

    List<Submission> findByIsPublishedTrue();

    List<Submission> findByTeamCodeOrderByCreatedAtDesc(String teamCode);

    List<Submission> findByDueDateBetween(LocalDateTime start, LocalDateTime end);

    List<Submission> findByCreatedByIdAndIsPublishedTrue(Long userId);
}
