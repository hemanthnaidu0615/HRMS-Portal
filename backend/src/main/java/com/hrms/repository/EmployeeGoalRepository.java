package com.hrms.repository;

import com.hrms.entity.EmployeeGoal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * EmployeeGoal Repository
 * Module: PERFORMANCE
 */
@Repository
public interface EmployeeGoalRepository extends JpaRepository<EmployeeGoal, UUID> {

    /**
     * Find all records by organization with pagination
     */
    @Query("SELECT e FROM EmployeeGoal e WHERE e.organizationId = :organizationId")
    Page<EmployeeGoal> findByOrganizationId(@Param("organizationId") UUID organizationId, Pageable pageable);

    /**
     * Find all records by organization
     */
    List<EmployeeGoal> findByOrganizationId(UUID organizationId);

    /**
     * Count records by organization
     */
    Long countByOrganizationId(UUID organizationId);
}
