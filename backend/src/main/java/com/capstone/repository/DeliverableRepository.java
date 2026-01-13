package com.capstone.repository;

import com.capstone.model.Deliverable;
import com.capstone.model.Project;
import com.capstone.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeliverableRepository extends JpaRepository<Deliverable, Long> {

    List<Deliverable> findByProject(Project project);

    List<Deliverable> findByAssignedTeam(Team team);

    List<Deliverable> findByStatus(String status);

    List<Deliverable> findByDueDateBefore(LocalDate date);

    @Query("SELECT d FROM Deliverable d WHERE d.project.id = :projectId ORDER BY d.dueDate ASC")
    List<Deliverable> findByProjectIdOrderByDueDate(@Param("projectId") Long projectId);

    @Query("SELECT d FROM Deliverable d WHERE d.assignedTeam.id = :teamId AND d.status != 'COMPLETED' ORDER BY d.dueDate ASC")
    List<Deliverable> findActiveDeliverablesByTeam(@Param("teamId") Long teamId);

    @Query("SELECT d FROM Deliverable d WHERE d.status = 'OVERDUE' ORDER BY d.dueDate ASC")
    List<Deliverable> findOverdueDeliverables();

    @Query("SELECT d FROM Deliverable d WHERE d.progressPercentage < 100 AND d.dueDate <= CURRENT_DATE AND d.status != 'COMPLETED'")
    List<Deliverable> findAtRiskDeliverables();

    Optional<Deliverable> findByGoogleSheetRowId(String googleSheetRowId);
}
