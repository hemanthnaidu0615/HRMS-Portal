package com.hrms.repository.attendance;

import com.hrms.entity.attendance.AttendanceSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface AttendanceSummaryRepository extends JpaRepository<AttendanceSummary, UUID> {

    List<AttendanceSummary> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<AttendanceSummary> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<AttendanceSummary> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM AttendanceSummary e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<AttendanceSummary> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
