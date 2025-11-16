package com.hrms.repository;

import com.hrms.entity.AuditLog;
import com.hrms.entity.Organization;
import com.hrms.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    Page<AuditLog> findByOrganizationOrderByPerformedAtDesc(Organization organization, Pageable pageable);
    Page<AuditLog> findByPerformedByOrderByPerformedAtDesc(User user, Pageable pageable);
    Page<AuditLog> findByActionTypeOrderByPerformedAtDesc(String actionType, Pageable pageable);
    Page<AuditLog> findByEntityTypeOrderByPerformedAtDesc(String entityType, Pageable pageable);
    Page<AuditLog> findByEntityTypeAndEntityIdOrderByPerformedAtDesc(String entityType, String entityId, Pageable pageable);
    Page<AuditLog> findByOrganizationAndActionTypeOrderByPerformedAtDesc(Organization organization, String actionType, Pageable pageable);
    Page<AuditLog> findByOrganizationAndEntityTypeOrderByPerformedAtDesc(Organization organization, String entityType, Pageable pageable);
    List<AuditLog> findByPerformedAtBetweenOrderByPerformedAtDesc(LocalDateTime startDate, LocalDateTime endDate);
}
