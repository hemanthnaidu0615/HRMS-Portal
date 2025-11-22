package com.hrms.dto.employee;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request DTO for creating/updating employee tax information
 * Supports country-specific tax fields for USA, UK, India, Canada, Australia
 */
public class EmployeeTaxInfoRequest {

    // ==================== Core Tax Information ====================

    @NotBlank(message = "Tax country is required")
    @Size(max = 100, message = "Tax country must not exceed 100 characters")
    private String taxCountry;

    @NotBlank(message = "Tax country code is required")
    @Size(min = 2, max = 3, message = "Tax country code must be 2-3 characters")
    private String taxCountryCode;

    @NotNull(message = "Tax year is required")
    @Min(value = 2000, message = "Tax year must be 2000 or later")
    private Integer taxYear;

    @Size(max = 50, message = "Tax residency status must not exceed 50 characters")
    private String taxResidencyStatus;

    private Boolean isTaxResident = true;
    private LocalDate residencyStartDate;

    // ==================== US-Specific ====================

    @Size(max = 50, message = "US filing status must not exceed 50 characters")
    private String usFilingStatus;

    @Min(value = 0, message = "US allowances cannot be negative")
    private Integer usAllowances;

    @DecimalMin(value = "0.00", message = "Additional withholding cannot be negative")
    private BigDecimal usAdditionalWithholding;

    private Boolean usExemptFromWithholding = false;
    private Boolean usW4Submitted = false;
    private LocalDate usW4SubmittedDate;

    @Size(max = 5, message = "US state code must not exceed 5 characters")
    private String usStateCode;

    @Size(max = 50, message = "US state filing status must not exceed 50 characters")
    private String usStateFilingStatus;

    @Min(value = 0, message = "US state allowances cannot be negative")
    private Integer usStateAllowances;

    @Size(max = 50, message = "US local tax code must not exceed 50 characters")
    private String usLocalTaxCode;

    // ==================== UK-Specific ====================

    @Size(max = 20, message = "UK tax code must not exceed 20 characters")
    private String ukTaxCode;

    private Boolean ukIsCumulative = true;

    @Size(max = 5, message = "UK starter declaration must not exceed 5 characters")
    private String ukStarterDeclaration;

    @Size(max = 10, message = "UK student loan plan must not exceed 10 characters")
    private String ukStudentLoanPlan;

    // ==================== India-Specific ====================

    @Size(max = 20, message = "India tax regime must not exceed 20 characters")
    private String indTaxRegime;

    private Boolean indHraExemptionApplicable = false;

    @DecimalMin(value = "0.00", message = "Section 80C amount cannot be negative")
    private BigDecimal indSection80cDeclared;

    @DecimalMin(value = "0.00", message = "Section 80D amount cannot be negative")
    private BigDecimal indSection80dDeclared;

    @DecimalMin(value = "0.00", message = "Other deductions cannot be negative")
    private BigDecimal indOtherDeductions;

    @DecimalMin(value = "0.00", message = "Total investment declaration cannot be negative")
    private BigDecimal indTotalInvestmentDeclaration;

    // ==================== Canada-Specific ====================

    @Size(max = 5, message = "Canada province code must not exceed 5 characters")
    private String canProvinceCode;

    private Boolean canTd1FederalSubmitted = false;
    private Boolean canTd1ProvincialSubmitted = false;

    @DecimalMin(value = "0.00", message = "Total claim amount cannot be negative")
    private BigDecimal canTotalClaimAmount;

    // ==================== Australia-Specific ====================

    private Boolean ausTaxFreeThreshold = true;
    private Boolean ausHelpDebt = false;
    private Boolean ausSfssDebt = false;

    // ==================== Generic ====================

    @Size(max = 50, message = "Tax bracket must not exceed 50 characters")
    private String taxBracket;

    @DecimalMin(value = "0.00", message = "Estimated annual tax cannot be negative")
    private BigDecimal estimatedAnnualTax;

    private Boolean annualDeclarationSubmitted = false;
    private LocalDate declarationSubmittedDate;
    private String customTaxData;

    // ==================== Getters and Setters ====================

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

    public String getCustomTaxData() {
        return customTaxData;
    }

    public void setCustomTaxData(String customTaxData) {
        this.customTaxData = customTaxData;
    }
}
