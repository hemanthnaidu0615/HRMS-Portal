package com.hrms.repository;

import com.hrms.entity.LeaveApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * LeaveApplication Repository
 * Module: LEAVE
 */
@Repository
public interface LeaveApplicationRepository extends JpaRepository<LeaveApplication, UUID> {

    /**
     * Find all records by organization with pagination
     */
    @Query("SELECT e FROM LeaveApplication e WHERE e.organizationId = :organizationId")
    Page<LeaveApplication> findByOrganizationId(@Param("organizationId") UUID organizationId, Pageable pageable);

    /**
     * Find all records by organization
     */
    List<LeaveApplication> findByOrganizationId(UUID organizationId);

    /**
     * Count records by organization
     */
    Long countByOrganizationId(UUID organizationId);
}
