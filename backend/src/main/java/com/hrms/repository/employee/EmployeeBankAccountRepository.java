package com.hrms.repository.employee;

import com.hrms.entity.Employee;
import com.hrms.entity.Organization;
import com.hrms.entity.employee.EmployeeBankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeBankAccountRepository extends JpaRepository<EmployeeBankAccount, UUID> {

    List<EmployeeBankAccount> findByEmployeeAndIsActiveTrue(Employee employee);

    List<EmployeeBankAccount> findByEmployeeIdAndIsActiveTrueOrderByPriorityAsc(UUID employeeId);

    Optional<EmployeeBankAccount> findByEmployeeAndIsPrimaryTrueAndIsActiveTrue(Employee employee);

    @Query("SELECT b FROM EmployeeBankAccount b WHERE b.employee.id = :employeeId " +
           "AND b.isPrimary = true AND b.isActive = true")
    Optional<EmployeeBankAccount> findPrimaryAccountByEmployeeId(@Param("employeeId") UUID employeeId);

    @Query("SELECT b FROM EmployeeBankAccount b WHERE b.employee.id = :employeeId " +
           "AND b.accountPurpose = :purpose AND b.isActive = true")
    List<EmployeeBankAccount> findByEmployeeIdAndPurpose(
            @Param("employeeId") UUID employeeId,
            @Param("purpose") EmployeeBankAccount.AccountPurpose purpose
    );

    @Query("SELECT b FROM EmployeeBankAccount b WHERE b.employee.id = :employeeId " +
           "AND b.isActive = true AND b.verificationStatus = 'PENDING'")
    List<EmployeeBankAccount> findPendingVerificationByEmployeeId(@Param("employeeId") UUID employeeId);

    @Query("SELECT b FROM EmployeeBankAccount b WHERE b.organization.id = :orgId " +
           "AND b.isActive = true AND b.verificationStatus = 'PENDING'")
    List<EmployeeBankAccount> findAllPendingVerificationByOrganization(@Param("orgId") UUID orgId);

    long countByEmployeeAndIsActiveTrue(Employee employee);

    @Query("SELECT COUNT(b) FROM EmployeeBankAccount b WHERE b.employee.id = :employeeId " +
           "AND b.isActive = true AND b.verificationStatus = 'VERIFIED'")
    long countVerifiedAccountsByEmployeeId(@Param("employeeId") UUID employeeId);

    @Query("SELECT COALESCE(MAX(b.priority), 0) FROM EmployeeBankAccount b " +
           "WHERE b.employee.id = :employeeId AND b.isActive = true")
    int findMaxPriorityByEmployeeId(@Param("employeeId") UUID employeeId);

    boolean existsByEmployeeAndAccountNumberAndIsActiveTrue(Employee employee, String accountNumber);

    List<EmployeeBankAccount> findByOrganization(Organization organization);

    void deleteByEmployee(Employee employee);
}
