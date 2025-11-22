package com.hrms.dto.employee;

import com.hrms.entity.employee.EmployeeTaxInfo;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for employee tax information
 */
public class EmployeeTaxInfoResponse {

    private UUID id;
    private UUID employeeId;
    private String employeeName;
    private UUID organizationId;

    // Core
    private String taxCountry;
    private String taxCountryCode;
    private Integer taxYear;
    private String taxResidencyStatus;
    private Boolean isTaxResident;
    private LocalDate residencyStartDate;

    // US
    private String usFilingStatus;
    private Integer usAllowances;
    private BigDecimal usAdditionalWithholding;
    private Boolean usExemptFromWithholding;
    private Boolean usW4Submitted;
    private LocalDate usW4SubmittedDate;
    private String usStateCode;
    private String usStateFilingStatus;
    private Integer usStateAllowances;
    private String usLocalTaxCode;

    // UK
    private String ukTaxCode;
    private Boolean ukIsCumulative;
    private String ukStarterDeclaration;
    private String ukStudentLoanPlan;

    // India
    private String indTaxRegime;
    private Boolean indHraExemptionApplicable;
    private BigDecimal indSection80cDeclared;
    private BigDecimal indSection80dDeclared;
    private BigDecimal indOtherDeductions;
    private BigDecimal indTotalInvestmentDeclaration;

    // Canada
    private String canProvinceCode;
    private Boolean canTd1FederalSubmitted;
    private Boolean canTd1ProvincialSubmitted;
    private BigDecimal canTotalClaimAmount;

    // Australia
    private Boolean ausTaxFreeThreshold;
    private Boolean ausHelpDebt;
    private Boolean ausSfssDebt;

    // Generic
    private String taxBracket;
    private BigDecimal estimatedAnnualTax;
    private BigDecimal yearToDateTaxPaid;
    private Boolean annualDeclarationSubmitted;
    private LocalDate declarationSubmittedDate;
    private UUID declarationDocumentId;
    private String customTaxData;

    // Status
    private Boolean isCurrent;
    private Boolean isVerified;
    private UUID verifiedById;
    private String verifiedByName;
    private LocalDateTime verifiedAt;

    // Computed
    private String taxSummary;
    private Boolean isDocumentationComplete;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Create response from entity
     */
    public static EmployeeTaxInfoResponse fromEntity(EmployeeTaxInfo entity) {
        EmployeeTaxInfoResponse response = new EmployeeTaxInfoResponse();

        response.setId(entity.getId());
        response.setEmployeeId(entity.getEmployee() != null ? entity.getEmployee().getId() : null);
        response.setEmployeeName(entity.getEmployee() != null ? entity.getEmployee().getFullName() : null);
        response.setOrganizationId(entity.getOrganization() != null ? entity.getOrganization().getId() : null);

        // Core
        response.setTaxCountry(entity.getTaxCountry());
        response.setTaxCountryCode(entity.getTaxCountryCode());
        response.setTaxYear(entity.getTaxYear());
        response.setTaxResidencyStatus(entity.getTaxResidencyStatus());
        response.setIsTaxResident(entity.getIsTaxResident());
        response.setResidencyStartDate(entity.getResidencyStartDate());

        // US
        response.setUsFilingStatus(entity.getUsFilingStatus());
        response.setUsAllowances(entity.getUsAllowances());
        response.setUsAdditionalWithholding(entity.getUsAdditionalWithholding());
        response.setUsExemptFromWithholding(entity.getUsExemptFromWithholding());
        response.setUsW4Submitted(entity.getUsW4Submitted());
        response.setUsW4SubmittedDate(entity.getUsW4SubmittedDate());
        response.setUsStateCode(entity.getUsStateCode());
        response.setUsStateFilingStatus(entity.getUsStateFilingStatus());
        response.setUsStateAllowances(entity.getUsStateAllowances());
        response.setUsLocalTaxCode(entity.getUsLocalTaxCode());

        // UK
        response.setUkTaxCode(entity.getUkTaxCode());
        response.setUkIsCumulative(entity.getUkIsCumulative());
        response.setUkStarterDeclaration(entity.getUkStarterDeclaration());
        response.setUkStudentLoanPlan(entity.getUkStudentLoanPlan());

        // India
        response.setIndTaxRegime(entity.getIndTaxRegime());
        response.setIndHraExemptionApplicable(entity.getIndHraExemptionApplicable());
        response.setIndSection80cDeclared(entity.getIndSection80cDeclared());
        response.setIndSection80dDeclared(entity.getIndSection80dDeclared());
        response.setIndOtherDeductions(entity.getIndOtherDeductions());
        response.setIndTotalInvestmentDeclaration(entity.getIndTotalInvestmentDeclaration());

        // Canada
        response.setCanProvinceCode(entity.getCanProvinceCode());
        response.setCanTd1FederalSubmitted(entity.getCanTd1FederalSubmitted());
        response.setCanTd1ProvincialSubmitted(entity.getCanTd1ProvincialSubmitted());
        response.setCanTotalClaimAmount(entity.getCanTotalClaimAmount());

        // Australia
        response.setAusTaxFreeThreshold(entity.getAusTaxFreeThreshold());
        response.setAusHelpDebt(entity.getAusHelpDebt());
        response.setAusSfssDebt(entity.getAusSfssDebt());

        // Generic
        response.setTaxBracket(entity.getTaxBracket());
        response.setEstimatedAnnualTax(entity.getEstimatedAnnualTax());
        response.setYearToDateTaxPaid(entity.getYearToDateTaxPaid());
        response.setAnnualDeclarationSubmitted(entity.getAnnualDeclarationSubmitted());
        response.setDeclarationSubmittedDate(entity.getDeclarationSubmittedDate());
        response.setDeclarationDocumentId(entity.getDeclarationDocument() != null ?
                entity.getDeclarationDocument().getId() : null);
        response.setCustomTaxData(entity.getCustomTaxData());

        // Status
        response.setIsCurrent(entity.getIsCurrent());
        response.setIsVerified(entity.getIsVerified());
        response.setVerifiedById(entity.getVerifiedBy() != null ? entity.getVerifiedBy().getId() : null);
        response.setVerifiedAt(entity.getVerifiedAt());

        // Computed
        response.setTaxSummary(entity.getTaxSummary());
        response.setIsDocumentationComplete(entity.isDocumentationComplete());

        // Audit
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());

        return response;
    }

    // ==================== Getters and Setters ====================

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(UUID employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public UUID getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(UUID organizationId) {
        this.organizationId = organizationId;
    }

    public String getTaxCountry() {
        return taxCountry;
    }

    public void setTaxCountry(String taxCountry) {
        this.taxCountry = taxCountry;
    }

    public String getTaxCountryCode() {
        return taxCountryCode;
    }

    public void setTaxCountryCode(String taxCountryCode) {
        this.taxCountryCode = taxCountryCode;
    }

    public Integer getTaxYear() {
        return taxYear;
    }

    public void setTaxYear(Integer taxYear) {
        this.taxYear = taxYear;
    }

    public String getTaxResidencyStatus() {
        return taxResidencyStatus;
    }

    public void setTaxResidencyStatus(String taxResidencyStatus) {
        this.taxResidencyStatus = taxResidencyStatus;
    }

    public Boolean getIsTaxResident() {
        return isTaxResident;
    }

    public void setIsTaxResident(Boolean isTaxResident) {
        this.isTaxResident = isTaxResident;
    }

    public LocalDate getResidencyStartDate() {
        return residencyStartDate;
    }

    public void setResidencyStartDate(LocalDate residencyStartDate) {
        this.residencyStartDate = residencyStartDate;
    }

    public String getUsFilingStatus() {
        return usFilingStatus;
    }

    public void setUsFilingStatus(String usFilingStatus) {
        this.usFilingStatus = usFilingStatus;
    }

    public Integer getUsAllowances() {
        return usAllowances;
    }

    public void setUsAllowances(Integer usAllowances) {
        this.usAllowances = usAllowances;
    }

    public BigDecimal getUsAdditionalWithholding() {
        return usAdditionalWithholding;
    }

    public void setUsAdditionalWithholding(BigDecimal usAdditionalWithholding) {
        this.usAdditionalWithholding = usAdditionalWithholding;
    }

    public Boolean getUsExemptFromWithholding() {
        return usExemptFromWithholding;
    }

    public void setUsExemptFromWithholding(Boolean usExemptFromWithholding) {
        this.usExemptFromWithholding = usExemptFromWithholding;
    }

    public Boolean getUsW4Submitted() {
        return usW4Submitted;
    }

    public void setUsW4Submitted(Boolean usW4Submitted) {
        this.usW4Submitted = usW4Submitted;
    }

    public LocalDate getUsW4SubmittedDate() {
        return usW4SubmittedDate;
    }

    public void setUsW4SubmittedDate(LocalDate usW4SubmittedDate) {
        this.usW4SubmittedDate = usW4SubmittedDate;
    }

    public String getUsStateCode() {
        return usStateCode;
    }

    public void setUsStateCode(String usStateCode) {
        this.usStateCode = usStateCode;
    }

    public String getUsStateFilingStatus() {
        return usStateFilingStatus;
    }

    public void setUsStateFilingStatus(String usStateFilingStatus) {
        this.usStateFilingStatus = usStateFilingStatus;
    }

    public Integer getUsStateAllowances() {
        return usStateAllowances;
    }

    public void setUsStateAllowances(Integer usStateAllowances) {
        this.usStateAllowances = usStateAllowances;
    }

    public String getUsLocalTaxCode() {
        return usLocalTaxCode;
    }

    public void setUsLocalTaxCode(String usLocalTaxCode) {
        this.usLocalTaxCode = usLocalTaxCode;
    }

    public String getUkTaxCode() {
        return ukTaxCode;
    }

    public void setUkTaxCode(String ukTaxCode) {
        this.ukTaxCode = ukTaxCode;
    }

    public Boolean getUkIsCumulative() {
        return ukIsCumulative;
    }

    public void setUkIsCumulative(Boolean ukIsCumulative) {
        this.ukIsCumulative = ukIsCumulative;
    }

    public String getUkStarterDeclaration() {
        return ukStarterDeclaration;
    }

    public void setUkStarterDeclaration(String ukStarterDeclaration) {
        this.ukStarterDeclaration = ukStarterDeclaration;
    }

    public String getUkStudentLoanPlan() {
        return ukStudentLoanPlan;
    }

    public void setUkStudentLoanPlan(String ukStudentLoanPlan) {
        this.ukStudentLoanPlan = ukStudentLoanPlan;
    }

    public String getIndTaxRegime() {
        return indTaxRegime;
    }

    public void setIndTaxRegime(String indTaxRegime) {
        this.indTaxRegime = indTaxRegime;
    }

    public Boolean getIndHraExemptionApplicable() {
        return indHraExemptionApplicable;
    }

    public void setIndHraExemptionApplicable(Boolean indHraExemptionApplicable) {
        this.indHraExemptionApplicable = indHraExemptionApplicable;
    }

    public BigDecimal getIndSection80cDeclared() {
        return indSection80cDeclared;
    }

    public void setIndSection80cDeclared(BigDecimal indSection80cDeclared) {
        this.indSection80cDeclared = indSection80cDeclared;
    }

    public BigDecimal getIndSection80dDeclared() {
        return indSection80dDeclared;
    }

    public void setIndSection80dDeclared(BigDecimal indSection80dDeclared) {
        this.indSection80dDeclared = indSection80dDeclared;
    }

    public BigDecimal getIndOtherDeductions() {
        return indOtherDeductions;
    }

    public void setIndOtherDeductions(BigDecimal indOtherDeductions) {
        this.indOtherDeductions = indOtherDeductions;
    }

    public BigDecimal getIndTotalInvestmentDeclaration() {
        return indTotalInvestmentDeclaration;
    }

    public void setIndTotalInvestmentDeclaration(BigDecimal indTotalInvestmentDeclaration) {
        this.indTotalInvestmentDeclaration = indTotalInvestmentDeclaration;
    }

    public String getCanProvinceCode() {
        return canProvinceCode;
    }

    public void setCanProvinceCode(String canProvinceCode) {
        this.canProvinceCode = canProvinceCode;
    }

    public Boolean getCanTd1FederalSubmitted() {
        return canTd1FederalSubmitted;
    }

    public void setCanTd1FederalSubmitted(Boolean canTd1FederalSubmitted) {
        this.canTd1FederalSubmitted = canTd1FederalSubmitted;
    }

    public Boolean getCanTd1ProvincialSubmitted() {
        return canTd1ProvincialSubmitted;
    }

    public void setCanTd1ProvincialSubmitted(Boolean canTd1ProvincialSubmitted) {
        this.canTd1ProvincialSubmitted = canTd1ProvincialSubmitted;
    }

    public BigDecimal getCanTotalClaimAmount() {
        return canTotalClaimAmount;
    }

    public void setCanTotalClaimAmount(BigDecimal canTotalClaimAmount) {
        this.canTotalClaimAmount = canTotalClaimAmount;
    }

    public Boolean getAusTaxFreeThreshold() {
        return ausTaxFreeThreshold;
    }

    public void setAusTaxFreeThreshold(Boolean ausTaxFreeThreshold) {
        this.ausTaxFreeThreshold = ausTaxFreeThreshold;
    }

    public Boolean getAusHelpDebt() {
        return ausHelpDebt;
    }

    public void setAusHelpDebt(Boolean ausHelpDebt) {
        this.ausHelpDebt = ausHelpDebt;
    }

    public Boolean getAusSfssDebt() {
        return ausSfssDebt;
    }

    public void setAusSfssDebt(Boolean ausSfssDebt) {
        this.ausSfssDebt = ausSfssDebt;
    }

    public String getTaxBracket() {
        return taxBracket;
    }

    public void setTaxBracket(String taxBracket) {
        this.taxBracket = taxBracket;
    }

    public BigDecimal getEstimatedAnnualTax() {
        return estimatedAnnualTax;
    }

    public void setEstimatedAnnualTax(BigDecimal estimatedAnnualTax) {
        this.estimatedAnnualTax = estimatedAnnualTax;
    }

    public BigDecimal getYearToDateTaxPaid() {
        return yearToDateTaxPaid;
    }

    public void setYearToDateTaxPaid(BigDecimal yearToDateTaxPaid) {
        this.yearToDateTaxPaid = yearToDateTaxPaid;
    }

    public Boolean getAnnualDeclarationSubmitted() {
        return annualDeclarationSubmitted;
    }

    public void setAnnualDeclarationSubmitted(Boolean annualDeclarationSubmitted) {
        this.annualDeclarationSubmitted = annualDeclarationSubmitted;
    }

    public LocalDate getDeclarationSubmittedDate() {
        return declarationSubmittedDate;
    }

    public void setDeclarationSubmittedDate(LocalDate declarationSubmittedDate) {
        this.declarationSubmittedDate = declarationSubmittedDate;
    }

    public UUID getDeclarationDocumentId() {
        return declarationDocumentId;
    }

    public void setDeclarationDocumentId(UUID declarationDocumentId) {
        this.declarationDocumentId = declarationDocumentId;
    }

    public String getCustomTaxData() {
        return customTaxData;
    }

    public void setCustomTaxData(String customTaxData) {
        this.customTaxData = customTaxData;
    }

    public Boolean getIsCurrent() {
        return isCurrent;
    }

    public void setIsCurrent(Boolean isCurrent) {
        this.isCurrent = isCurrent;
    }

    public Boolean getIsVerified() {
        return isVerified;
    }

    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }

    public UUID getVerifiedById() {
        return verifiedById;
    }

    public void setVerifiedById(UUID verifiedById) {
        this.verifiedById = verifiedById;
    }

    public String getVerifiedByName() {
        return verifiedByName;
    }

    public void setVerifiedByName(String verifiedByName) {
        this.verifiedByName = verifiedByName;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public String getTaxSummary() {
        return taxSummary;
    }

    public void setTaxSummary(String taxSummary) {
        this.taxSummary = taxSummary;
    }

    public Boolean getIsDocumentationComplete() {
        return isDocumentationComplete;
    }

    public void setIsDocumentationComplete(Boolean isDocumentationComplete) {
        this.isDocumentationComplete = isDocumentationComplete;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
