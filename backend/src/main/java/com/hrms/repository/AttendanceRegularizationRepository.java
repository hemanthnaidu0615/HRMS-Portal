package com.hrms.repository;

import com.hrms.entity.AttendanceRegularization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * AttendanceRegularization Repository
 * Module: ATTENDANCE
 */
@Repository
public interface AttendanceRegularizationRepository extends JpaRepository<AttendanceRegularization, UUID> {

    /**
     * Find all records by organization with pagination
     */
    @Query("SELECT e FROM AttendanceRegularization e WHERE e.organizationId = :organizationId")
    Page<AttendanceRegularization> findByOrganizationId(@Param("organizationId") UUID organizationId, Pageable pageable);

    /**
     * Find all records by organization
     */
    List<AttendanceRegularization> findByOrganizationId(UUID organizationId);

    /**
     * Count records by organization
     */
    Long countByOrganizationId(UUID organizationId);
}
