package com.hrms.repository.timesheet;

import com.hrms.entity.timesheet.TimesheetEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface TimesheetEntryRepository extends JpaRepository<TimesheetEntry, UUID> {

    List<TimesheetEntry> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<TimesheetEntry> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<TimesheetEntry> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM TimesheetEntry e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<TimesheetEntry> findActiveByOrganization(@Param("organizationId") UUID organizationId);

    // Additional methods for ScheduledTaskService
    @Query("SELECT COUNT(e) FROM TimesheetEntry e WHERE e.employee.id = :employeeId AND " +
           "e.entryDate BETWEEN :startDate AND :endDate AND e.deletedAt IS NULL")
    long countByEmployeeIdAndDateBetween(@Param("employeeId") UUID employeeId,
                                         @Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate);
}
