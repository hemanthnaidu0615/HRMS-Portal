package com.hrms.repository.attendance;

import com.hrms.entity.attendance.EmployeeShift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface EmployeeShiftRepository extends JpaRepository<EmployeeShift, UUID> {

    List<EmployeeShift> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<EmployeeShift> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<EmployeeShift> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM EmployeeShift e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<EmployeeShift> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
