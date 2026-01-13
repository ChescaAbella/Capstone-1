package com.capstone.repository;

import com.capstone.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {

    Optional<Team> findByName(String name);

    List<Team> findByStatus(String status);

    List<Team> findByNameContainingIgnoreCase(String name);
}
