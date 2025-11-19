package com.hrms.repository.payroll;

import com.hrms.entity.payroll.PayrollRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface PayrollRunRepository extends JpaRepository<PayrollRun, UUID> {

    List<PayrollRun> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<PayrollRun> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<PayrollRun> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM PayrollRun e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<PayrollRun> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
