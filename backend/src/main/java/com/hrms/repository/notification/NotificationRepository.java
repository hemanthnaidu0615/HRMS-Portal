package com.hrms.repository.notification;

import com.hrms.entity.notification.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<Notification> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<Notification> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM Notification e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<Notification> findActiveByOrganization(@Param("organizationId") UUID organizationId);

    List<Notification> findByCreatedAtBeforeAndDeletedAtIsNull(LocalDateTime cutoffDate);
}
