package com.capstone.repository;

import com.capstone.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    
    /**
     * Get all submissions for a deliverable
     */
    List<Submission> findByDeliverableId(Long deliverableId);
    
    /**
     * Get latest submission for a deliverable
     */
    @Query("SELECT s FROM Submission s WHERE s.deliverable.id = :deliverableId AND s.isLatest = true ORDER BY s.versionNumber DESC LIMIT 1")
    Optional<Submission> findLatestSubmissionByDeliverableId(@Param("deliverableId") Long deliverableId);
    
    /**
     * Get all submissions by a user
     */
    List<Submission> findBySubmittedBy(String submittedBy);
    
    /**
     * Get submissions by status
     */
    @Query("SELECT s FROM Submission s WHERE s.deliverable.id = :deliverableId AND s.status = :status")
    List<Submission> findByDeliverableAndStatus(@Param("deliverableId") Long deliverableId, @Param("status") String status);
    
    /**
     * Get submission history for a deliverable
     */
    @Query("SELECT s FROM Submission s WHERE s.deliverable.id = :deliverableId ORDER BY s.versionNumber DESC")
    List<Submission> findSubmissionHistory(@Param("deliverableId") Long deliverableId);
}
