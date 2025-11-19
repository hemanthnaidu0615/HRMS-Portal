package com.hrms.repository;

import com.hrms.entity.AttendanceRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * AttendanceRecord Repository
 * Module: ATTENDANCE
 */
@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, UUID> {

    /**
     * Find all records by organization with pagination
     */
    @Query("SELECT e FROM AttendanceRecord e WHERE e.organizationId = :organizationId")
    Page<AttendanceRecord> findByOrganizationId(@Param("organizationId") UUID organizationId, Pageable pageable);

    /**
     * Find all records by organization
     */
    List<AttendanceRecord> findByOrganizationId(UUID organizationId);

    /**
     * Count records by organization
     */
    Long countByOrganizationId(UUID organizationId);
}
