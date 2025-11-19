package com.hrms.repository;

import com.hrms.entity.ExpenseClaim;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * ExpenseClaim Repository
 * Module: EXPENSES
 */
@Repository
public interface ExpenseClaimRepository extends JpaRepository<ExpenseClaim, UUID> {

    /**
     * Find all records by organization with pagination
     */
    @Query("SELECT e FROM ExpenseClaim e WHERE e.organizationId = :organizationId")
    Page<ExpenseClaim> findByOrganizationId(@Param("organizationId") UUID organizationId, Pageable pageable);

    /**
     * Find all records by organization
     */
    List<ExpenseClaim> findByOrganizationId(UUID organizationId);

    /**
     * Count records by organization
     */
    Long countByOrganizationId(UUID organizationId);
}
