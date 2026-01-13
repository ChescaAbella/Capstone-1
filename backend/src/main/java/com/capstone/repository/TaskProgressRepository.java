package com.capstone.repository;

import com.capstone.model.Deliverable;
import com.capstone.model.TaskProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskProgressRepository extends JpaRepository<TaskProgress, Long> {

    List<TaskProgress> findByDeliverable(Deliverable deliverable);

    @Query("SELECT tp FROM TaskProgress tp WHERE tp.deliverable.id = :deliverableId ORDER BY tp.recordedAt DESC")
    List<TaskProgress> findLatestProgressByDeliverable(@Param("deliverableId") Long deliverableId);

    @Query("SELECT tp FROM TaskProgress tp WHERE tp.recordedAt >= :startDate AND tp.recordedAt <= :endDate ORDER BY tp.recordedAt DESC")
    List<TaskProgress> findProgressInDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
