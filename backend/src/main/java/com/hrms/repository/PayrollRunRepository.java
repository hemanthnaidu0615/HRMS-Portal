package com.hrms.repository;

import com.hrms.entity.PayrollRun;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * PayrollRun Repository
 * Module: PAYROLL
 */
@Repository
public interface PayrollRunRepository extends JpaRepository<PayrollRun, UUID> {

    /**
     * Find all records by organization with pagination
     */
    @Query("SELECT e FROM PayrollRun e WHERE e.organizationId = :organizationId")
    Page<PayrollRun> findByOrganizationId(@Param("organizationId") UUID organizationId, Pageable pageable);

    /**
     * Find all records by organization
     */
    List<PayrollRun> findByOrganizationId(UUID organizationId);

    /**
     * Count records by organization
     */
    Long countByOrganizationId(UUID organizationId);
}
