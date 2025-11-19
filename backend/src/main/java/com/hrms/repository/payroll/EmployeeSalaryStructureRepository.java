package com.hrms.repository.payroll;

import com.hrms.entity.payroll.EmployeeSalaryStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface EmployeeSalaryStructureRepository extends JpaRepository<EmployeeSalaryStructure, UUID> {

    List<EmployeeSalaryStructure> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<EmployeeSalaryStructure> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<EmployeeSalaryStructure> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM EmployeeSalaryStructure e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<EmployeeSalaryStructure> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
