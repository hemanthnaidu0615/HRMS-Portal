package com.hrms.repository.asset;

import com.hrms.entity.asset.AssetMaintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface AssetMaintenanceRepository extends JpaRepository<AssetMaintenance, UUID> {

    List<AssetMaintenance> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<AssetMaintenance> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<AssetMaintenance> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM AssetMaintenance e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<AssetMaintenance> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
