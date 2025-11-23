package com.hrms.repository;

import com.hrms.entity.Employee;
import com.hrms.entity.Organization;
import com.hrms.entity.employee.EmployeeTaxInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Employee Tax Information
 * Provides methods for querying tax records by employee, country, year
 */
@Repository
public interface EmployeeTaxInfoRepository extends JpaRepository<EmployeeTaxInfo, UUID> {

    // ==================== Find by Employee ====================

    /**
     * Find all tax records for an employee
     */
    List<EmployeeTaxInfo> findByEmployeeOrderByTaxYearDesc(Employee employee);

    /**
     * Find all tax records for an employee by ID
     */
    List<EmployeeTaxInfo> findByEmployeeIdOrderByTaxYearDesc(UUID employeeId);

    /**
     * Find current tax records for an employee
     */
    List<EmployeeTaxInfo> findByEmployeeAndIsCurrentTrue(Employee employee);

    /**
     * Find current tax record for an employee for a specific country
     */
    Optional<EmployeeTaxInfo> findByEmployeeAndTaxCountryCodeAndIsCurrentTrue(
            Employee employee, String taxCountryCode);

    /**
     * Find current tax record by employee ID and country
     */
    Optional<EmployeeTaxInfo> findByEmployeeIdAndTaxCountryCodeAndIsCurrentTrue(
            UUID employeeId, String taxCountryCode);

    // ==================== Find by Year ====================

    /**
     * Find tax record for employee, country, and year
     */
    Optional<EmployeeTaxInfo> findByEmployeeAndTaxCountryCodeAndTaxYear(
            Employee employee, String taxCountryCode, Integer taxYear);

    /**
     * Find tax record by employee ID, country, and year
     */
    Optional<EmployeeTaxInfo> findByEmployeeIdAndTaxCountryCodeAndTaxYear(
            UUID employeeId, String taxCountryCode, Integer taxYear);

    /**
     * Find all tax records for a specific year
     */
    List<EmployeeTaxInfo> findByTaxYear(Integer taxYear);

    /**
     * Find all current tax records for a specific country code
     */
    List<EmployeeTaxInfo> findByTaxCountryCodeAndIsCurrentTrue(String taxCountryCode);

    // ==================== Find by Organization ====================

    /**
     * Find all tax records for an organization
     */
    List<EmployeeTaxInfo> findByOrganizationOrderByCreatedAtDesc(Organization organization);

    /**
     * Find all current tax records for an organization
     */
    List<EmployeeTaxInfo> findByOrganizationAndIsCurrentTrue(Organization organization);

    /**
     * Find all tax records for an organization by country
     */
    List<EmployeeTaxInfo> findByOrganizationAndTaxCountryCodeAndIsCurrentTrue(
            Organization organization, String taxCountryCode);

    /**
     * Count employees with tax info for an organization
     */
    @Query("SELECT COUNT(DISTINCT t.employee.id) FROM EmployeeTaxInfo t WHERE t.organization = :org AND t.isCurrent = true")
    long countEmployeesWithTaxInfoByOrganization(@Param("org") Organization organization);

    // ==================== Verification Queries ====================

    /**
     * Find unverified tax records for an organization
     */
    List<EmployeeTaxInfo> findByOrganizationAndIsVerifiedFalseAndIsCurrentTrue(Organization organization);

    /**
     * Count unverified tax records
     */
    long countByOrganizationAndIsVerifiedFalseAndIsCurrentTrue(Organization organization);

    // ==================== US-Specific Queries ====================

    /**
     * Find employees without W-4 submitted (US)
     */
    @Query("SELECT t FROM EmployeeTaxInfo t WHERE t.organization = :org " +
           "AND t.taxCountryCode = 'USA' AND t.isCurrent = true " +
           "AND (t.usW4Submitted = false OR t.usW4Submitted IS NULL)")
    List<EmployeeTaxInfo> findUsEmployeesWithoutW4(@Param("org") Organization organization);

    /**
     * Find employees exempt from withholding (US)
     */
    List<EmployeeTaxInfo> findByOrganizationAndTaxCountryCodeAndUsExemptFromWithholdingTrueAndIsCurrentTrue(
            Organization organization, String taxCountryCode);

    // ==================== India-Specific Queries ====================

    /**
     * Find employees under old tax regime (India)
     */
    @Query("SELECT t FROM EmployeeTaxInfo t WHERE t.organization = :org " +
           "AND t.taxCountryCode = 'IND' AND t.isCurrent = true " +
           "AND t.indTaxRegime = 'old_regime'")
    List<EmployeeTaxInfo> findIndiaOldRegimeEmployees(@Param("org") Organization organization);

    /**
     * Find employees with investment declarations (India)
     */
    @Query("SELECT t FROM EmployeeTaxInfo t WHERE t.organization = :org " +
           "AND t.taxCountryCode = 'IND' AND t.isCurrent = true " +
           "AND t.indTotalInvestmentDeclaration > 0")
    List<EmployeeTaxInfo> findIndiaEmployeesWithDeclarations(@Param("org") Organization organization);

    // ==================== Canada-Specific Queries ====================

    /**
     * Find employees without TD1 forms (Canada)
     */
    @Query("SELECT t FROM EmployeeTaxInfo t WHERE t.organization = :org " +
           "AND t.taxCountryCode = 'CAN' AND t.isCurrent = true " +
           "AND (t.canTd1FederalSubmitted = false OR t.canTd1ProvincialSubmitted = false)")
    List<EmployeeTaxInfo> findCanadaEmployeesWithoutTd1(@Param("org") Organization organization);

    // ==================== Update Operations ====================

    /**
     * Mark previous tax records as not current when new one is created
     */
    @Modifying
    @Query("UPDATE EmployeeTaxInfo t SET t.isCurrent = false " +
           "WHERE t.employee.id = :employeeId AND t.taxCountryCode = :countryCode " +
           "AND t.id != :excludeId AND t.isCurrent = true")
    int markPreviousRecordsAsNotCurrent(
            @Param("employeeId") UUID employeeId,
            @Param("countryCode") String countryCode,
            @Param("excludeId") UUID excludeId);

    /**
     * Verify tax record
     */
    @Modifying
    @Query("UPDATE EmployeeTaxInfo t SET t.isVerified = true, t.verifiedBy.id = :verifierId, " +
           "t.verifiedAt = CURRENT_TIMESTAMP WHERE t.id = :taxInfoId")
    int verifyTaxInfo(@Param("taxInfoId") UUID taxInfoId, @Param("verifierId") UUID verifierId);

    // ==================== Existence Checks ====================

    /**
     * Check if employee has any tax info
     */
    boolean existsByEmployee(Employee employee);

    /**
     * Check if employee has tax info for specific country
     */
    boolean existsByEmployeeAndTaxCountryCodeAndIsCurrentTrue(Employee employee, String taxCountryCode);

    /**
     * Check if employee has current tax info
     */
    boolean existsByEmployeeIdAndIsCurrentTrue(UUID employeeId);
}
