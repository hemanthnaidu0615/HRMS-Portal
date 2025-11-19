package com.hrms.repository.asset;

import com.hrms.entity.asset.AssetAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface AssetAssignmentRepository extends JpaRepository<AssetAssignment, UUID> {

    List<AssetAssignment> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<AssetAssignment> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<AssetAssignment> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM AssetAssignment e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<AssetAssignment> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
