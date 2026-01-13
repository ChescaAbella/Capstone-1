package com.capstone.repository;

import com.capstone.entity.LoginAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LoginAuditLogRepository extends JpaRepository<LoginAuditLog, Long> {

    List<LoginAuditLog> findByUserIdOrderByLoginTimeDesc(Long userId);

    List<LoginAuditLog> findByUsernameOrderByLoginTimeDesc(String username);

    List<LoginAuditLog> findBySuccessOrderByLoginTimeDesc(Boolean success);

    List<LoginAuditLog> findByLoginTimeBetweenOrderByLoginTimeDesc(LocalDateTime startTime, LocalDateTime endTime);

    @Query("SELECT l FROM LoginAuditLog l WHERE l.loginTime >= :startTime AND l.loginTime <= :endTime ORDER BY l.loginTime DESC")
    List<LoginAuditLog> findAuditLogsByDateRange(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    @Query("SELECT l FROM LoginAuditLog l WHERE (LOWER(l.username) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(l.ipAddress) LIKE LOWER(CONCAT('%', :query, '%'))) ORDER BY l.loginTime DESC")
    List<LoginAuditLog> searchAuditLogs(@Param("query") String query);

    @Query("SELECT l FROM LoginAuditLog l WHERE l.success = :success ORDER BY l.loginTime DESC")
    List<LoginAuditLog> findByLoginStatus(@Param("success") Boolean success);
}
