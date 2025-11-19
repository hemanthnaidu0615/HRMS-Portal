package com.hrms.repository.asset;

import com.hrms.entity.asset.AssetCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface AssetCategoryRepository extends JpaRepository<AssetCategory, UUID> {

    List<AssetCategory> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<AssetCategory> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<AssetCategory> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM AssetCategory e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<AssetCategory> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
