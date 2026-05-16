package com.cit.submit.repository;

import com.cit.submit.model.StudentImport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentImportRepository extends JpaRepository<StudentImport, Long> {
    Optional<StudentImport> findByEmail(String email);

    List<StudentImport> findByImportBatchId(String importBatchId);

    List<StudentImport> findByImportedByUserId(Long userId);

    List<StudentImport> findByIsRegisteredFalse();

    boolean existsByEmail(String email);
}
