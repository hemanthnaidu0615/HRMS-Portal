package com.hrms.repository.payroll;

import com.hrms.entity.payroll.PayslipLineItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface PayslipLineItemRepository extends JpaRepository<PayslipLineItem, UUID> {

    List<PayslipLineItem> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<PayslipLineItem> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<PayslipLineItem> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM PayslipLineItem e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<PayslipLineItem> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
