package com.hrms.repository;

import com.hrms.entity.PerformanceReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * PerformanceReview Repository
 * Module: PERFORMANCE
 */
@Repository
public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, UUID> {

    /**
     * Find all records by organization with pagination
     */
    @Query("SELECT e FROM PerformanceReview e WHERE e.organizationId = :organizationId")
    Page<PerformanceReview> findByOrganizationId(@Param("organizationId") UUID organizationId, Pageable pageable);

    /**
     * Find all records by organization
     */
    List<PerformanceReview> findByOrganizationId(UUID organizationId);

    /**
     * Count records by organization
     */
    Long countByOrganizationId(UUID organizationId);
}
