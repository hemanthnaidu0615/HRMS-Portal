package com.hrms.repository.attendance;

import com.hrms.entity.attendance.BiometricLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface BiometricLogRepository extends JpaRepository<BiometricLog, UUID> {

    List<BiometricLog> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<BiometricLog> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<BiometricLog> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM BiometricLog e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<BiometricLog> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
