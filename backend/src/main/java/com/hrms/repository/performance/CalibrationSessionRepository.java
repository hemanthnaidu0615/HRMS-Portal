package com.hrms.repository.performance;

import com.hrms.entity.performance.CalibrationSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface CalibrationSessionRepository extends JpaRepository<CalibrationSession, UUID> {

    List<CalibrationSession> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<CalibrationSession> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<CalibrationSession> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM CalibrationSession e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<CalibrationSession> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
