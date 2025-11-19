package com.hrms.repository;

import com.hrms.entity.Department;
import com.hrms.entity.Employee;
import com.hrms.entity.Organization;
import com.hrms.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, UUID> {
    Optional<Employee> findByUser(User user);
    Optional<Employee> findByUser_Id(UUID userId);
    List<Employee> findByReportsToId(UUID managerId);
    List<Employee> findByOrganization(Organization organization);
    Page<Employee> findByOrganization(Organization organization, Pageable pageable);
    List<Employee> findByDepartment(Department department);
    long countByOrganizationAndDeletedAtIsNull(Organization organization);

    // Additional methods for ScheduledTaskService
    List<Employee> findByEmploymentStatusAndDeletedAtIsNull(String employmentStatus);

    @Query("SELECT e FROM Employee e WHERE e.deletedAt IS NULL AND " +
           "EXISTS (SELECT pg FROM e.permissionGroups pg WHERE pg.name = :roleName)")
    List<Employee> findByRoleName(@Param("roleName") String roleName);

    @Query("SELECT DISTINCT e FROM Employee e WHERE e.deletedAt IS NULL AND " +
           "EXISTS (SELECT emp FROM Employee emp WHERE emp.reportsTo = e)")
    List<Employee> findManagers();

    @Query("SELECT e FROM Employee e WHERE e.deletedAt IS NULL AND " +
           "MONTH(e.dateOfBirth) = :month AND DAY(e.dateOfBirth) = :day")
    List<Employee> findByBirthday(@Param("month") int month, @Param("day") int day);

    // Demo data cleanup methods
    int deleteByOrganization(Organization organization);
    long countByOrganization(Organization organization);
}
