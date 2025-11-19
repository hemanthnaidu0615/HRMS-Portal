package com.hrms.repository;

import com.hrms.entity.Shift;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Shift Repository
 * Module: ATTENDANCE
 */
@Repository
public interface ShiftRepository extends JpaRepository<Shift, UUID> {

    /**
     * Find all records by organization with pagination
     */
    @Query("SELECT e FROM Shift e WHERE e.organizationId = :organizationId")
    Page<Shift> findByOrganizationId(@Param("organizationId") UUID organizationId, Pageable pageable);

    /**
     * Find all records by organization
     */
    List<Shift> findByOrganizationId(UUID organizationId);

    /**
     * Count records by organization
     */
    Long countByOrganizationId(UUID organizationId);
}
