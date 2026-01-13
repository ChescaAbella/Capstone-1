package com.capstone.repository;

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
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByTeam(Team team);

    List<Project> findByStatus(String status);

    List<Project> findByDeadlineBefore(LocalDate date);

    @Query("SELECT p FROM Project p WHERE p.status = :status AND p.team.id = :teamId")
    List<Project> findByStatusAndTeam(@Param("status") String status, @Param("teamId") Long teamId);

    List<Project> findByNameContainingIgnoreCase(String name);

    Optional<Project> findByGoogleSheetId(String googleSheetId);
}
