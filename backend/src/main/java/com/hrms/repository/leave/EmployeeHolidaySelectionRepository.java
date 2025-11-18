package com.hrms.repository.leave;

import com.hrms.entity.leave.EmployeeHolidaySelection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface EmployeeHolidaySelectionRepository extends JpaRepository<EmployeeHolidaySelection, UUID> {

    List<EmployeeHolidaySelection> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<EmployeeHolidaySelection> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<EmployeeHolidaySelection> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM EmployeeHolidaySelection e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<EmployeeHolidaySelection> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
