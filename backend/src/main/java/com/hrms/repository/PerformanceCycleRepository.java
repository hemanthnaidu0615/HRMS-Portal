package com.hrms.repository;

import com.hrms.entity.PerformanceCycle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * PerformanceCycle Repository
 * Module: PERFORMANCE
 */
@Repository
public interface PerformanceCycleRepository extends JpaRepository<PerformanceCycle, UUID> {

    /**
     * Find all records by organization with pagination
     */
    @Query("SELECT e FROM PerformanceCycle e WHERE e.organizationId = :organizationId")
    Page<PerformanceCycle> findByOrganizationId(@Param("organizationId") UUID organizationId, Pageable pageable);

    /**
     * Find all records by organization
     */
    List<PerformanceCycle> findByOrganizationId(UUID organizationId);

    /**
     * Count records by organization
     */
    Long countByOrganizationId(UUID organizationId);
}
