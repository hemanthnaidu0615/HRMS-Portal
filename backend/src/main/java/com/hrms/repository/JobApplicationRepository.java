package com.hrms.repository;

import com.hrms.entity.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * JobApplication Repository
 * Module: RECRUITMENT
 */
@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, UUID> {

    /**
     * Find all records by organization with pagination
     */
    @Query("SELECT e FROM JobApplication e WHERE e.organizationId = :organizationId")
    Page<JobApplication> findByOrganizationId(@Param("organizationId") UUID organizationId, Pageable pageable);

    /**
     * Find all records by organization
     */
    List<JobApplication> findByOrganizationId(UUID organizationId);

    /**
     * Count records by organization
     */
    Long countByOrganizationId(UUID organizationId);
}
