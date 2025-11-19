package com.hrms.repository.leave;

import com.hrms.entity.leave.CompensatoryOffCredit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface CompensatoryOffCreditRepository extends JpaRepository<CompensatoryOffCredit, UUID> {

    List<CompensatoryOffCredit> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<CompensatoryOffCredit> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<CompensatoryOffCredit> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM CompensatoryOffCredit e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<CompensatoryOffCredit> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
