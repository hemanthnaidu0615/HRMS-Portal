package com.hrms.repository;

import com.hrms.entity.LeaveBalance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * LeaveBalance Repository
 * Module: LEAVE
 */
@Repository
public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, UUID> {

    /**
     * Find all records by organization with pagination
     */
    @Query("SELECT e FROM LeaveBalance e WHERE e.organizationId = :organizationId")
    Page<LeaveBalance> findByOrganizationId(@Param("organizationId") UUID organizationId, Pageable pageable);

    /**
     * Find all records by organization
     */
    List<LeaveBalance> findByOrganizationId(UUID organizationId);

    /**
     * Count records by organization
     */
    Long countByOrganizationId(UUID organizationId);
}
