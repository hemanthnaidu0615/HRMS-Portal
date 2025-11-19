package com.hrms.repository.asset;

import com.hrms.entity.asset.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, UUID> {

    List<Asset> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<Asset> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<Asset> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM Asset e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<Asset> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
