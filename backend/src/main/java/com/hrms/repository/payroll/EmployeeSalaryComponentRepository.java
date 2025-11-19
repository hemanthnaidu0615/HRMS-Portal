package com.hrms.repository.payroll;

import com.hrms.entity.payroll.EmployeeSalaryComponent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface EmployeeSalaryComponentRepository extends JpaRepository<EmployeeSalaryComponent, UUID> {

    List<EmployeeSalaryComponent> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<EmployeeSalaryComponent> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<EmployeeSalaryComponent> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM EmployeeSalaryComponent e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<EmployeeSalaryComponent> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
