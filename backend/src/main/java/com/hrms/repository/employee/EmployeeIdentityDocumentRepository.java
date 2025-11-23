package com.hrms.repository.employee;

import com.hrms.entity.Employee;
import com.hrms.entity.Organization;
import com.hrms.entity.employee.EmployeeIdentityDocument;
import com.hrms.entity.employee.IdentityDocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeIdentityDocumentRepository extends JpaRepository<EmployeeIdentityDocument, UUID> {

    List<EmployeeIdentityDocument> findByEmployeeAndActiveTrue(Employee employee);

    List<EmployeeIdentityDocument> findByEmployeeIdAndActiveTrue(UUID employeeId);

    Optional<EmployeeIdentityDocument> findByEmployeeAndDocumentTypeAndActiveTrue(
            Employee employee,
            IdentityDocumentType documentType
    );

    @Query("SELECT d FROM EmployeeIdentityDocument d WHERE d.employee.id = :employeeId " +
           "AND d.documentType.documentTypeCode = :documentCode AND d.active = true")
    Optional<EmployeeIdentityDocument> findByEmployeeIdAndDocumentCode(
            @Param("employeeId") UUID employeeId,
            @Param("documentCode") String documentCode
    );

    @Query("SELECT d FROM EmployeeIdentityDocument d WHERE d.active = true " +
           "AND d.expiryDate IS NOT NULL AND d.expiryDate < :date")
    List<EmployeeIdentityDocument> findExpiredDocuments(@Param("date") LocalDate date);

    @Query("SELECT d FROM EmployeeIdentityDocument d WHERE d.active = true " +
           "AND d.expiryDate IS NOT NULL AND d.expiryDate BETWEEN :startDate AND :endDate")
    List<EmployeeIdentityDocument> findDocumentsExpiringSoon(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT d FROM EmployeeIdentityDocument d WHERE d.employee.id = :employeeId " +
           "AND d.active = true AND d.verificationStatus = 'PENDING'")
    List<EmployeeIdentityDocument> findPendingVerificationByEmployeeId(@Param("employeeId") UUID employeeId);

    @Query("SELECT d FROM EmployeeIdentityDocument d WHERE d.organization.id = :orgId " +
           "AND d.active = true AND d.verificationStatus = 'PENDING'")
    List<EmployeeIdentityDocument> findAllPendingVerificationByOrganization(@Param("orgId") UUID orgId);

    long countByEmployeeAndActiveTrue(Employee employee);

    @Query("SELECT COUNT(d) FROM EmployeeIdentityDocument d WHERE d.employee.id = :employeeId " +
           "AND d.active = true AND d.verificationStatus = 'VERIFIED'")
    long countVerifiedDocumentsByEmployeeId(@Param("employeeId") UUID employeeId);

    List<EmployeeIdentityDocument> findByOrganization(Organization organization);

    void deleteByEmployee(Employee employee);
}
