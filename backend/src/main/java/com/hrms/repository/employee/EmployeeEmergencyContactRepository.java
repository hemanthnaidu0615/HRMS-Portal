package com.hrms.repository.employee;

import com.hrms.entity.Employee;
import com.hrms.entity.Organization;
import com.hrms.entity.employee.EmployeeEmergencyContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeEmergencyContactRepository extends JpaRepository<EmployeeEmergencyContact, UUID> {

    List<EmployeeEmergencyContact> findByEmployeeAndIsActiveTrue(Employee employee);

    List<EmployeeEmergencyContact> findByEmployeeIdAndIsActiveTrueOrderByPriorityAsc(UUID employeeId);

    Optional<EmployeeEmergencyContact> findByEmployeeAndIsPrimaryTrueAndIsActiveTrue(Employee employee);

    @Query("SELECT c FROM EmployeeEmergencyContact c WHERE c.employee.id = :employeeId " +
           "AND c.priority = 1 AND c.isActive = true")
    Optional<EmployeeEmergencyContact> findPrimaryContactByEmployeeId(@Param("employeeId") UUID employeeId);

    long countByEmployeeAndIsActiveTrue(Employee employee);

    @Query("SELECT COALESCE(MAX(c.priority), 0) FROM EmployeeEmergencyContact c " +
           "WHERE c.employee.id = :employeeId AND c.isActive = true")
    int findMaxPriorityByEmployeeId(@Param("employeeId") UUID employeeId);

    List<EmployeeEmergencyContact> findByOrganization(Organization organization);

    void deleteByEmployee(Employee employee);
}
