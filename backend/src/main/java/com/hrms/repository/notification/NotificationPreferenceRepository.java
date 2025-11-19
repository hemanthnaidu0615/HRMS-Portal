package com.hrms.repository.notification;

import com.hrms.entity.notification.NotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, UUID> {

    List<NotificationPreference> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<NotificationPreference> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<NotificationPreference> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM NotificationPreference e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<NotificationPreference> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
