package com.hrms.repository.payroll;

import com.hrms.entity.payroll.TaxSlab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface TaxSlabRepository extends JpaRepository<TaxSlab, UUID> {

    List<TaxSlab> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<TaxSlab> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<TaxSlab> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM TaxSlab e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<TaxSlab> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
