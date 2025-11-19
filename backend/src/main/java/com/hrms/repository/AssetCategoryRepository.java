package com.hrms.repository;

import com.hrms.entity.AssetCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * AssetCategory Repository
 * Module: ASSETS
 */
@Repository
public interface AssetCategoryRepository extends JpaRepository<AssetCategory, UUID> {

    /**
     * Find all records by organization with pagination
     */
    @Query("SELECT e FROM AssetCategory e WHERE e.organizationId = :organizationId")
    Page<AssetCategory> findByOrganizationId(@Param("organizationId") UUID organizationId, Pageable pageable);

    /**
     * Find all records by organization
     */
    List<AssetCategory> findByOrganizationId(UUID organizationId);

    /**
     * Count records by organization
     */
    Long countByOrganizationId(UUID organizationId);
}
