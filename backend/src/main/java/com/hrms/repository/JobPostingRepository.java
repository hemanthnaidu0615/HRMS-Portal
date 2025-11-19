package com.hrms.repository;

import com.hrms.entity.JobPosting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * JobPosting Repository
 * Module: RECRUITMENT
 */
@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, UUID> {

    /**
     * Find all records by organization with pagination
     */
    @Query("SELECT e FROM JobPosting e WHERE e.organizationId = :organizationId")
    Page<JobPosting> findByOrganizationId(@Param("organizationId") UUID organizationId, Pageable pageable);

    /**
     * Find all records by organization
     */
    List<JobPosting> findByOrganizationId(UUID organizationId);

    /**
     * Count records by organization
     */
    Long countByOrganizationId(UUID organizationId);
}
