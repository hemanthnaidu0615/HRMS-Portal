package com.hrms.repository.notification;

import com.hrms.entity.notification.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, UUID> {

    List<Reminder> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<Reminder> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<Reminder> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM Reminder e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<Reminder> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
