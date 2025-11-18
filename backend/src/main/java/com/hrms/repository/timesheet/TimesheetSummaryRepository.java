package com.hrms.repository.timesheet;

import com.hrms.entity.timesheet.TimesheetSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface TimesheetSummaryRepository extends JpaRepository<TimesheetSummary, UUID> {

    List<TimesheetSummary> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<TimesheetSummary> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<TimesheetSummary> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM TimesheetSummary e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<TimesheetSummary> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
