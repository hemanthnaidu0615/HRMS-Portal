package com.hrms.repository;

import com.hrms.entity.SalaryComponent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * SalaryComponent Repository
 * Module: PAYROLL
 */
@Repository
public interface SalaryComponentRepository extends JpaRepository<SalaryComponent, UUID> {

    /**
     * Find all records by organization with pagination
     */
    @Query("SELECT e FROM SalaryComponent e WHERE e.organizationId = :organizationId")
    Page<SalaryComponent> findByOrganizationId(@Param("organizationId") UUID organizationId, Pageable pageable);

    /**
     * Find all records by organization
     */
    List<SalaryComponent> findByOrganizationId(UUID organizationId);

    /**
     * Count records by organization
     */
    Long countByOrganizationId(UUID organizationId);
}
