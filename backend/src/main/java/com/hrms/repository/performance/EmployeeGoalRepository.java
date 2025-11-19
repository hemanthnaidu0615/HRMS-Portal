package com.hrms.repository.performance;

import com.hrms.entity.performance.EmployeeGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface EmployeeGoalRepository extends JpaRepository<EmployeeGoal, UUID> {

    List<EmployeeGoal> findByOrganizationIdAndDeletedAtIsNull(UUID organizationId);

    List<EmployeeGoal> findByOrganizationIdAndIsActiveTrueAndDeletedAtIsNull(UUID organizationId);

    Optional<EmployeeGoal> findByIdAndOrganizationIdAndDeletedAtIsNull(UUID id, UUID organizationId);

    @Query("SELECT e FROM EmployeeGoal e WHERE e.organization.id = :organizationId AND e.deletedAt IS NULL")
    List<EmployeeGoal> findActiveByOrganization(@Param("organizationId") UUID organizationId);
}
