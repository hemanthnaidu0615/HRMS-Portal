package com.hrms.repository.notification;

import com.hrms.entity.notification.NotificationTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, UUID> {

    List<NotificationTemplate> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<NotificationTemplate> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<NotificationTemplate> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM NotificationTemplate e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<NotificationTemplate> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
