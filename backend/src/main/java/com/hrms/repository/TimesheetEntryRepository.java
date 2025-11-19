package com.hrms.repository;

import com.hrms.entity.TimesheetEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * TimesheetEntry Repository
 * Module: TIMESHEET
 */
@Repository
public interface TimesheetEntryRepository extends JpaRepository<TimesheetEntry, UUID> {

    /**
     * Find all records by organization with pagination
     */
    @Query("SELECT e FROM TimesheetEntry e WHERE e.organizationId = :organizationId")
    Page<TimesheetEntry> findByOrganizationId(@Param("organizationId") UUID organizationId, Pageable pageable);

    /**
     * Find all records by organization
     */
    List<TimesheetEntry> findByOrganizationId(UUID organizationId);

    /**
     * Count records by organization
     */
    Long countByOrganizationId(UUID organizationId);
}
