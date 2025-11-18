package com.hrms.repository.payroll;

import com.hrms.entity.payroll.Payslip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface PayslipRepository extends JpaRepository<Payslip, UUID> {

    List<Payslip> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<Payslip> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<Payslip> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM Payslip e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<Payslip> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
