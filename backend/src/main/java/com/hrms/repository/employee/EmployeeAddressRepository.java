package com.hrms.repository.employee;

import com.hrms.entity.Employee;
import com.hrms.entity.Organization;
import com.hrms.entity.employee.EmployeeAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeAddressRepository extends JpaRepository<EmployeeAddress, UUID> {

    List<EmployeeAddress> findByEmployeeAndIsActiveTrue(Employee employee);

    List<EmployeeAddress> findByEmployeeIdAndIsActiveTrue(UUID employeeId);

    Optional<EmployeeAddress> findByEmployeeAndAddressTypeAndIsActiveTrue(
            Employee employee,
            EmployeeAddress.AddressType addressType
    );

    Optional<EmployeeAddress> findByEmployeeAndIsPrimaryTrueAndIsActiveTrue(Employee employee);

    @Query("SELECT a FROM EmployeeAddress a WHERE a.employee.id = :employeeId " +
           "AND a.addressType = :addressType AND a.isActive = true")
    Optional<EmployeeAddress> findActiveByEmployeeIdAndType(
            @Param("employeeId") UUID employeeId,
            @Param("addressType") EmployeeAddress.AddressType addressType
    );

    long countByEmployeeAndIsActiveTrue(Employee employee);

    @Query("SELECT COUNT(a) FROM EmployeeAddress a WHERE a.employee.id = :employeeId AND a.isActive = true")
    long countActiveAddressesByEmployeeId(@Param("employeeId") UUID employeeId);

    List<EmployeeAddress> findByOrganization(Organization organization);

    void deleteByEmployee(Employee employee);
}
