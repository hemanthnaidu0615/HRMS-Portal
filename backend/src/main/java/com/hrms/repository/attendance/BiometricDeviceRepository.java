package com.hrms.repository.attendance;

import com.hrms.entity.attendance.BiometricDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface BiometricDeviceRepository extends JpaRepository<BiometricDevice, UUID> {

    List<BiometricDevice> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<BiometricDevice> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<BiometricDevice> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM BiometricDevice e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<BiometricDevice> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
