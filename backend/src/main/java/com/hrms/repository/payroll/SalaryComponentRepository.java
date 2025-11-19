package com.hrms.repository.payroll;

import com.hrms.entity.payroll.SalaryComponent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface SalaryComponentRepository extends JpaRepository<SalaryComponent, UUID> {

    List<SalaryComponent> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<SalaryComponent> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<SalaryComponent> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM SalaryComponent e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<SalaryComponent> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
