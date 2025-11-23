package com.hrms.service;

import com.hrms.dto.employee.EmployeeTaxInfoRequest;
import com.hrms.dto.employee.EmployeeTaxInfoResponse;
import com.hrms.entity.Employee;
import com.hrms.entity.Organization;
import com.hrms.entity.User;
import com.hrms.entity.employee.EmployeeTaxInfo;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.EmployeeTaxInfoRepository;
import com.hrms.repository.OrganizationRepository;
import com.hrms.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for managing employee tax information
 * Handles country-specific tax data for USA, UK, India, Canada, Australia
 */
@Service
@Transactional
public class EmployeeTaxInfoService {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeTaxInfoService.class);

    private final EmployeeTaxInfoRepository taxInfoRepository;
    private final EmployeeRepository employeeRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    public EmployeeTaxInfoService(EmployeeTaxInfoRepository taxInfoRepository,
                                  EmployeeRepository employeeRepository,
                                  OrganizationRepository organizationRepository,
                                  UserRepository userRepository) {
        this.taxInfoRepository = taxInfoRepository;
        this.employeeRepository = employeeRepository;
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
    }

    // ==================== Create Operations ====================

    /**
     * Create or update tax info for an employee
     * Marks previous records for same country as not current
     */
    public EmployeeTaxInfoResponse createOrUpdateTaxInfo(UUID employeeId, EmployeeTaxInfoRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found: " + employeeId));

        Organization organization = employee.getOrganization();

        // Check if existing current record exists for this country/year
        Optional<EmployeeTaxInfo> existing = taxInfoRepository
                .findByEmployeeAndTaxCountryCodeAndTaxYear(employee, request.getTaxCountryCode(), request.getTaxYear());

        EmployeeTaxInfo taxInfo;
        if (existing.isPresent()) {
            // Update existing record
            taxInfo = existing.get();
            logger.info("Updating existing tax info for employee {} country {} year {}",
                    employeeId, request.getTaxCountryCode(), request.getTaxYear());
        } else {
            // Create new record and mark previous as not current
            taxInfo = new EmployeeTaxInfo();
            taxInfo.setEmployee(employee);
            taxInfo.setOrganization(organization);

            logger.info("Creating new tax info for employee {} country {} year {}",
                    employeeId, request.getTaxCountryCode(), request.getTaxYear());
        }

        // Map request to entity
        mapRequestToEntity(request, taxInfo);

        // Save and mark previous records as not current
        EmployeeTaxInfo saved = taxInfoRepository.save(taxInfo);

        if (Boolean.TRUE.equals(saved.getIsCurrent())) {
            taxInfoRepository.markPreviousRecordsAsNotCurrent(
                    employeeId, request.getTaxCountryCode(), saved.getId());
        }

        return EmployeeTaxInfoResponse.fromEntity(saved);
    }

    /**
     * Create tax info during onboarding
     */
    public EmployeeTaxInfoResponse createOnboardingTaxInfo(UUID employeeId, String countryCode, int taxYear) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found: " + employeeId));

        EmployeeTaxInfo taxInfo = EmployeeTaxInfo.builder()
                .employee(employee)
                .organization(employee.getOrganization())
                .taxCountryCode(countryCode.toUpperCase())
                .taxCountry(getCountryName(countryCode))
                .taxYear(taxYear)
                .isCurrent(true)
                .isTaxResident(true)
                .isVerified(false)
                .build();

        EmployeeTaxInfo saved = taxInfoRepository.save(taxInfo);
        logger.info("Created onboarding tax info for employee {} country {}", employeeId, countryCode);

        return EmployeeTaxInfoResponse.fromEntity(saved);
    }

    // ==================== Read Operations ====================

    /**
     * Get all tax records for an employee
     */
    @Transactional(readOnly = true)
    public List<EmployeeTaxInfoResponse> getEmployeeTaxInfo(UUID employeeId) {
        return taxInfoRepository.findByEmployeeIdOrderByTaxYearDesc(employeeId)
                .stream()
                .map(EmployeeTaxInfoResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get current tax info for employee for a country
     */
    @Transactional(readOnly = true)
    public Optional<EmployeeTaxInfoResponse> getCurrentTaxInfo(UUID employeeId, String countryCode) {
        return taxInfoRepository.findByEmployeeIdAndTaxCountryCodeAndIsCurrentTrue(employeeId, countryCode)
                .map(EmployeeTaxInfoResponse::fromEntity);
    }

    /**
     * Get tax info by ID
     */
    @Transactional(readOnly = true)
    public Optional<EmployeeTaxInfoResponse> getTaxInfoById(UUID taxInfoId) {
        return taxInfoRepository.findById(taxInfoId)
                .map(EmployeeTaxInfoResponse::fromEntity);
    }

    /**
     * Get all current tax records for an organization
     */
    @Transactional(readOnly = true)
    public List<EmployeeTaxInfoResponse> getOrganizationTaxInfo(UUID organizationId) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found: " + organizationId));

        return taxInfoRepository.findByOrganizationAndIsCurrentTrue(org)
                .stream()
                .map(EmployeeTaxInfoResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get unverified tax records for an organization
     */
    @Transactional(readOnly = true)
    public List<EmployeeTaxInfoResponse> getUnverifiedTaxInfo(UUID organizationId) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found: " + organizationId));

        return taxInfoRepository.findByOrganizationAndIsVerifiedFalseAndIsCurrentTrue(org)
                .stream()
                .map(EmployeeTaxInfoResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ==================== US-Specific Operations ====================

    /**
     * Get US employees without W-4 submitted
     */
    @Transactional(readOnly = true)
    public List<EmployeeTaxInfoResponse> getUsEmployeesWithoutW4(UUID organizationId) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found: " + organizationId));

        return taxInfoRepository.findUsEmployeesWithoutW4(org)
                .stream()
                .map(EmployeeTaxInfoResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Submit W-4 for US employee
     */
    public EmployeeTaxInfoResponse submitW4(UUID taxInfoId, EmployeeTaxInfoRequest request) {
        EmployeeTaxInfo taxInfo = taxInfoRepository.findById(taxInfoId)
                .orElseThrow(() -> new IllegalArgumentException("Tax info not found: " + taxInfoId));

        if (!"USA".equals(taxInfo.getTaxCountryCode())) {
            throw new IllegalArgumentException("W-4 is only applicable for US tax records");
        }

        // Update W-4 specific fields
        taxInfo.setUsFilingStatus(request.getUsFilingStatus());
        taxInfo.setUsAllowances(request.getUsAllowances());
        taxInfo.setUsAdditionalWithholding(request.getUsAdditionalWithholding());
        taxInfo.setUsExemptFromWithholding(request.getUsExemptFromWithholding());
        taxInfo.setUsW4Submitted(true);
        taxInfo.setUsW4SubmittedDate(java.time.LocalDate.now());

        // State info
        taxInfo.setUsStateCode(request.getUsStateCode());
        taxInfo.setUsStateFilingStatus(request.getUsStateFilingStatus());
        taxInfo.setUsStateAllowances(request.getUsStateAllowances());
        taxInfo.setUsLocalTaxCode(request.getUsLocalTaxCode());

        EmployeeTaxInfo saved = taxInfoRepository.save(taxInfo);
        logger.info("W-4 submitted for tax info {}", taxInfoId);

        return EmployeeTaxInfoResponse.fromEntity(saved);
    }

    // ==================== India-Specific Operations ====================

    /**
     * Get India employees with old tax regime
     */
    @Transactional(readOnly = true)
    public List<EmployeeTaxInfoResponse> getIndiaOldRegimeEmployees(UUID organizationId) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found: " + organizationId));

        return taxInfoRepository.findIndiaOldRegimeEmployees(org)
                .stream()
                .map(EmployeeTaxInfoResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Update India investment declaration
     */
    public EmployeeTaxInfoResponse updateIndiaDeclaration(UUID taxInfoId, EmployeeTaxInfoRequest request) {
        EmployeeTaxInfo taxInfo = taxInfoRepository.findById(taxInfoId)
                .orElseThrow(() -> new IllegalArgumentException("Tax info not found: " + taxInfoId));

        if (!"IND".equals(taxInfo.getTaxCountryCode())) {
            throw new IllegalArgumentException("Investment declaration is only applicable for India tax records");
        }

        taxInfo.setIndTaxRegime(request.getIndTaxRegime());
        taxInfo.setIndHraExemptionApplicable(request.getIndHraExemptionApplicable());
        taxInfo.setIndSection80cDeclared(request.getIndSection80cDeclared());
        taxInfo.setIndSection80dDeclared(request.getIndSection80dDeclared());
        taxInfo.setIndOtherDeductions(request.getIndOtherDeductions());
        taxInfo.setIndTotalInvestmentDeclaration(request.getIndTotalInvestmentDeclaration());
        taxInfo.setAnnualDeclarationSubmitted(true);
        taxInfo.setDeclarationSubmittedDate(java.time.LocalDate.now());

        EmployeeTaxInfo saved = taxInfoRepository.save(taxInfo);
        logger.info("India declaration updated for tax info {}", taxInfoId);

        return EmployeeTaxInfoResponse.fromEntity(saved);
    }

    // ==================== Verification Operations ====================

    /**
     * Verify tax info (HR/Finance action)
     */
    public EmployeeTaxInfoResponse verifyTaxInfo(UUID taxInfoId, UUID verifierId) {
        EmployeeTaxInfo taxInfo = taxInfoRepository.findById(taxInfoId)
                .orElseThrow(() -> new IllegalArgumentException("Tax info not found: " + taxInfoId));

        User verifier = userRepository.findById(verifierId)
                .orElseThrow(() -> new IllegalArgumentException("Verifier not found: " + verifierId));

        taxInfo.setIsVerified(true);
        taxInfo.setVerifiedBy(verifier);
        taxInfo.setVerifiedAt(LocalDateTime.now());

        EmployeeTaxInfo saved = taxInfoRepository.save(taxInfo);
        logger.info("Tax info {} verified by user {}", taxInfoId, verifierId);

        return EmployeeTaxInfoResponse.fromEntity(saved);
    }

    /**
     * Reject/unverify tax info
     */
    public EmployeeTaxInfoResponse unverifyTaxInfo(UUID taxInfoId) {
        EmployeeTaxInfo taxInfo = taxInfoRepository.findById(taxInfoId)
                .orElseThrow(() -> new IllegalArgumentException("Tax info not found: " + taxInfoId));

        taxInfo.setIsVerified(false);
        taxInfo.setVerifiedBy(null);
        taxInfo.setVerifiedAt(null);

        EmployeeTaxInfo saved = taxInfoRepository.save(taxInfo);
        logger.info("Tax info {} unverified", taxInfoId);

        return EmployeeTaxInfoResponse.fromEntity(saved);
    }

    // ==================== Statistics ====================

    /**
     * Count employees with tax info for organization
     */
    @Transactional(readOnly = true)
    public long countEmployeesWithTaxInfo(UUID organizationId) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found: " + organizationId));

        return taxInfoRepository.countEmployeesWithTaxInfoByOrganization(org);
    }

    /**
     * Count unverified tax records
     */
    @Transactional(readOnly = true)
    public long countUnverifiedTaxInfo(UUID organizationId) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found: " + organizationId));

        return taxInfoRepository.countByOrganizationAndIsVerifiedFalseAndIsCurrentTrue(org);
    }

    /**
     * Check if employee has tax info
     */
    @Transactional(readOnly = true)
    public boolean hasEmployeeTaxInfo(UUID employeeId) {
        return taxInfoRepository.existsByEmployeeIdAndIsCurrentTrue(employeeId);
    }

    // ==================== Helper Methods ====================

    private void mapRequestToEntity(EmployeeTaxInfoRequest request, EmployeeTaxInfo entity) {
        // Core
        entity.setTaxCountry(request.getTaxCountry());
        entity.setTaxCountryCode(request.getTaxCountryCode().toUpperCase());
        entity.setTaxYear(request.getTaxYear());
        entity.setTaxResidencyStatus(request.getTaxResidencyStatus());
        entity.setIsTaxResident(request.getIsTaxResident());
        entity.setResidencyStartDate(request.getResidencyStartDate());
        entity.setIsCurrent(true);

        // US
        entity.setUsFilingStatus(request.getUsFilingStatus());
        entity.setUsAllowances(request.getUsAllowances());
        entity.setUsAdditionalWithholding(request.getUsAdditionalWithholding());
        entity.setUsExemptFromWithholding(request.getUsExemptFromWithholding());
        entity.setUsW4Submitted(request.getUsW4Submitted());
        entity.setUsW4SubmittedDate(request.getUsW4SubmittedDate());
        entity.setUsStateCode(request.getUsStateCode());
        entity.setUsStateFilingStatus(request.getUsStateFilingStatus());
        entity.setUsStateAllowances(request.getUsStateAllowances());
        entity.setUsLocalTaxCode(request.getUsLocalTaxCode());

        // UK
        entity.setUkTaxCode(request.getUkTaxCode());
        entity.setUkIsCumulative(request.getUkIsCumulative());
        entity.setUkStarterDeclaration(request.getUkStarterDeclaration());
        entity.setUkStudentLoanPlan(request.getUkStudentLoanPlan());

        // India
        entity.setIndTaxRegime(request.getIndTaxRegime());
        entity.setIndHraExemptionApplicable(request.getIndHraExemptionApplicable());
        entity.setIndSection80cDeclared(request.getIndSection80cDeclared());
        entity.setIndSection80dDeclared(request.getIndSection80dDeclared());
        entity.setIndOtherDeductions(request.getIndOtherDeductions());
        entity.setIndTotalInvestmentDeclaration(request.getIndTotalInvestmentDeclaration());

        // Canada
        entity.setCanProvinceCode(request.getCanProvinceCode());
        entity.setCanTd1FederalSubmitted(request.getCanTd1FederalSubmitted());
        entity.setCanTd1ProvincialSubmitted(request.getCanTd1ProvincialSubmitted());
        entity.setCanTotalClaimAmount(request.getCanTotalClaimAmount());

        // Australia
        entity.setAusTaxFreeThreshold(request.getAusTaxFreeThreshold());
        entity.setAusHelpDebt(request.getAusHelpDebt());
        entity.setAusSfssDebt(request.getAusSfssDebt());

        // Generic
        entity.setTaxBracket(request.getTaxBracket());
        entity.setEstimatedAnnualTax(request.getEstimatedAnnualTax());
        entity.setAnnualDeclarationSubmitted(request.getAnnualDeclarationSubmitted());
        entity.setDeclarationSubmittedDate(request.getDeclarationSubmittedDate());
        entity.setCustomTaxData(request.getCustomTaxData());
    }

    private String getCountryName(String countryCode) {
        return switch (countryCode.toUpperCase()) {
            case "USA" -> "United States";
            case "GBR" -> "United Kingdom";
            case "IND" -> "India";
            case "CAN" -> "Canada";
            case "AUS" -> "Australia";
            case "MEX" -> "Mexico";
            case "DEU" -> "Germany";
            case "FRA" -> "France";
            default -> countryCode;
        };
    }
}
