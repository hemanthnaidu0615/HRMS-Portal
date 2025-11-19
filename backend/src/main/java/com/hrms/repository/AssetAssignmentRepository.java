package com.hrms.repository;

import com.hrms.entity.AssetAssignment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * AssetAssignment Repository
 * Module: ASSETS
 */
@Repository
public interface AssetAssignmentRepository extends JpaRepository<AssetAssignment, UUID> {

    /**
     * Find all records by organization with pagination
     */
    @Query("SELECT e FROM AssetAssignment e WHERE e.organizationId = :organizationId")
    Page<AssetAssignment> findByOrganizationId(@Param("organizationId") UUID organizationId, Pageable pageable);

    /**
     * Find all records by organization
     */
    List<AssetAssignment> findByOrganizationId(UUID organizationId);

    /**
     * Count records by organization
     */
    Long countByOrganizationId(UUID organizationId);
}
