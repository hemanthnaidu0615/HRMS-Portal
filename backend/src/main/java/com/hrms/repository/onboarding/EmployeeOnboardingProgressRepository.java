package com.hrms.repository.onboarding;

import com.hrms.entity.Employee;
import com.hrms.entity.Organization;
import com.hrms.entity.onboarding.EmployeeOnboardingProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeOnboardingProgressRepository extends JpaRepository<EmployeeOnboardingProgress, UUID> {

    Optional<EmployeeOnboardingProgress> findByEmployee(Employee employee);

    Optional<EmployeeOnboardingProgress> findByEmployeeId(UUID employeeId);

    List<EmployeeOnboardingProgress> findByOrganization(Organization organization);

    List<EmployeeOnboardingProgress> findByOrganizationAndOverallStatus(Organization organization, String status);

    @Query("SELECT p FROM EmployeeOnboardingProgress p WHERE p.organization = :org AND p.overallStatus IN ('NOT_STARTED', 'IN_PROGRESS')")
    List<EmployeeOnboardingProgress> findActiveOnboarding(@Param("org") Organization organization);

    @Query("SELECT p FROM EmployeeOnboardingProgress p WHERE p.organization = :org AND p.overdueSteps > 0")
    List<EmployeeOnboardingProgress> findWithOverdueSteps(@Param("org") Organization organization);

    @Query("SELECT p FROM EmployeeOnboardingProgress p LEFT JOIN FETCH p.stepStatuses WHERE p.id = :id")
    Optional<EmployeeOnboardingProgress> findByIdWithStepStatuses(@Param("id") UUID id);

    @Query("SELECT p FROM EmployeeOnboardingProgress p LEFT JOIN FETCH p.stepStatuses WHERE p.employee.id = :employeeId")
    Optional<EmployeeOnboardingProgress> findByEmployeeIdWithStepStatuses(@Param("employeeId") UUID employeeId);

    @Query("SELECT COUNT(p) FROM EmployeeOnboardingProgress p WHERE p.organization = :org AND p.overallStatus = 'IN_PROGRESS'")
    long countActiveOnboarding(@Param("org") Organization organization);

    @Query("SELECT AVG(p.overallPercentage) FROM EmployeeOnboardingProgress p WHERE p.organization = :org AND p.overallStatus = 'IN_PROGRESS'")
    Double getAverageProgressPercentage(@Param("org") Organization organization);

    boolean existsByEmployeeAndOverallStatusIn(Employee employee, List<String> statuses);
}
