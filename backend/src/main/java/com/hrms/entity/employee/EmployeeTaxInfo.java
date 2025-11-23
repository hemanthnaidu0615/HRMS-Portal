package com.hrms.entity.employee;

import com.hrms.entity.Employee;
import com.hrms.entity.Organization;
import com.hrms.entity.User;
import com.hrms.entity.Document;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Employee Tax Information Entity
 * Country-Agnostic: Supports tax systems for USA, UK, India, Australia, Canada
 * Each employee can have multiple tax records (per country, per year)
 * Only one record per (employee, country, year) combination can be current
 */
@Entity
@Table(name = "employee_tax_info", indexes = {
    @Index(name = "idx_emp_tax_employee", columnList = "employee_id"),
    @Index(name = "idx_emp_tax_country", columnList = "tax_country_code"),
    @Index(name = "idx_emp_tax_year", columnList = "tax_year")
})
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeTaxInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    // ==================== Core Tax Information ====================

    @NotBlank(message = "Tax country is required")
    @Size(max = 100, message = "Tax country must not exceed 100 characters")
    @Column(name = "tax_country", nullable = false, length = 100)
    private String taxCountry;

    @NotBlank(message = "Tax country code is required")
    @Size(max = 3, message = "Tax country code must not exceed 3 characters")
    @Column(name = "tax_country_code", nullable = false, length = 3)
    private String taxCountryCode;

    @NotNull(message = "Tax year is required")
    @Min(value = 2000, message = "Tax year must be 2000 or later")
    @Max(value = 2100, message = "Tax year must be 2100 or earlier")
    @Column(name = "tax_year", nullable = false)
    private Integer taxYear;

    @Size(max = 50, message = "Tax residency status must not exceed 50 characters")
    @Column(name = "tax_residency_status", length = 50)
    private String taxResidencyStatus; // resident, non_resident, resident_alien, etc.

    @Column(name = "is_tax_resident")
    @Builder.Default
    private Boolean isTaxResident = true;

    @Column(name = "residency_start_date")
    private LocalDate residencyStartDate;

    // ==================== US-Specific Tax Fields ====================

    @Size(max = 50, message = "US filing status must not exceed 50 characters")
    @Column(name = "us_filing_status", length = 50)
    private String usFilingStatus; // single, married_filing_jointly, married_filing_separately, head_of_household, qualifying_widow

    @Min(value = 0, message = "US allowances cannot be negative")
    @Column(name = "us_allowances")
    private Integer usAllowances;

    @DecimalMin(value = "0.00", message = "Additional withholding cannot be negative")
    @Column(name = "us_additional_withholding", precision = 10, scale = 2)
    private BigDecimal usAdditionalWithholding;

    @Column(name = "us_exempt_from_withholding")
    @Builder.Default
    private Boolean usExemptFromWithholding = false;

    @Column(name = "us_w4_submitted")
    @Builder.Default
    private Boolean usW4Submitted = false;

    @Column(name = "us_w4_submitted_date")
    private LocalDate usW4SubmittedDate;

    @Size(max = 5, message = "US state code must not exceed 5 characters")
    @Column(name = "us_state_code", length = 5)
    private String usStateCode; // CA, NY, TX, etc.

    @Size(max = 50, message = "US state filing status must not exceed 50 characters")
    @Column(name = "us_state_filing_status", length = 50)
    private String usStateFilingStatus;

    @Min(value = 0, message = "US state allowances cannot be negative")
    @Column(name = "us_state_allowances")
    private Integer usStateAllowances;

    @Size(max = 50, message = "US local tax code must not exceed 50 characters")
    @Column(name = "us_local_tax_code", length = 50)
    private String usLocalTaxCode;

    // ==================== UK-Specific Tax Fields ====================

    @Size(max = 20, message = "UK tax code must not exceed 20 characters")
    @Column(name = "uk_tax_code", length = 20)
    private String ukTaxCode; // e.g., 1257L

    @Column(name = "uk_is_cumulative")
    @Builder.Default
    private Boolean ukIsCumulative = true;

    @Size(max = 5, message = "UK starter declaration must not exceed 5 characters")
    @Column(name = "uk_starter_declaration", length = 5)
    private String ukStarterDeclaration; // A, B, or C

    @Size(max = 10, message = "UK student loan plan must not exceed 10 characters")
    @Column(name = "uk_student_loan_plan", length = 10)
    private String ukStudentLoanPlan; // Plan1, Plan2, Plan4, Postgraduate

    // ==================== India-Specific Tax Fields ====================

    @Size(max = 20, message = "India tax regime must not exceed 20 characters")
    @Column(name = "ind_tax_regime", length = 20)
    private String indTaxRegime; // old_regime, new_regime

    @Column(name = "ind_hra_exemption_applicable")
    @Builder.Default
    private Boolean indHraExemptionApplicable = false;

    @DecimalMin(value = "0.00", message = "Section 80C amount cannot be negative")
    @Column(name = "ind_section_80c_declared", precision = 12, scale = 2)
    private BigDecimal indSection80cDeclared;

    @DecimalMin(value = "0.00", message = "Section 80D amount cannot be negative")
    @Column(name = "ind_section_80d_declared", precision = 12, scale = 2)
    private BigDecimal indSection80dDeclared;

    @DecimalMin(value = "0.00", message = "Other deductions cannot be negative")
    @Column(name = "ind_other_deductions", precision = 12, scale = 2)
    private BigDecimal indOtherDeductions;

    @DecimalMin(value = "0.00", message = "Total investment declaration cannot be negative")
    @Column(name = "ind_total_investment_declaration", precision = 12, scale = 2)
    private BigDecimal indTotalInvestmentDeclaration;

    // ==================== Canada-Specific Tax Fields ====================

    @Size(max = 5, message = "Canada province code must not exceed 5 characters")
    @Column(name = "can_province_code", length = 5)
    private String canProvinceCode; // ON, BC, QC, etc.

    @Column(name = "can_td1_federal_submitted")
    @Builder.Default
    private Boolean canTd1FederalSubmitted = false;

    @Column(name = "can_td1_provincial_submitted")
    @Builder.Default
    private Boolean canTd1ProvincialSubmitted = false;

    @DecimalMin(value = "0.00", message = "Total claim amount cannot be negative")
    @Column(name = "can_total_claim_amount", precision = 12, scale = 2)
    private BigDecimal canTotalClaimAmount;

    // ==================== Australia-Specific Tax Fields ====================

    @Column(name = "aus_tax_free_threshold")
    @Builder.Default
    private Boolean ausTaxFreeThreshold = true;

    @Column(name = "aus_help_debt")
    @Builder.Default
    private Boolean ausHelpDebt = false; // HELP/HECS debt

    @Column(name = "aus_sfss_debt")
    @Builder.Default
    private Boolean ausSfssDebt = false; // Student Financial Supplement Scheme

    // ==================== Generic Tax Fields ====================

    @Size(max = 50, message = "Tax bracket must not exceed 50 characters")
    @Column(name = "tax_bracket", length = 50)
    private String taxBracket;

    @DecimalMin(value = "0.00", message = "Estimated annual tax cannot be negative")
    @Column(name = "estimated_annual_tax", precision = 12, scale = 2)
    private BigDecimal estimatedAnnualTax;

    @DecimalMin(value = "0.00", message = "Year to date tax paid cannot be negative")
    @Column(name = "year_to_date_tax_paid", precision = 12, scale = 2)
    private BigDecimal yearToDateTaxPaid;

    @Column(name = "annual_declaration_submitted")
    @Builder.Default
    private Boolean annualDeclarationSubmitted = false;

    @Column(name = "declaration_submitted_date")
    private LocalDate declarationSubmittedDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "declaration_document_id")
    private Document declarationDocument;

    @Column(name = "custom_tax_data", columnDefinition = "TEXT")
    private String customTaxData; // JSON for country-specific extensions

    // ==================== Status & Verification ====================

    @Column(name = "is_current")
    @Builder.Default
    private Boolean isCurrent = true;

    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    // ==================== Audit Fields ====================

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ==================== Enums for Type Safety ====================

    /**
     * US Filing Status options (W-4)
     */
    public enum UsFilingStatus {
        SINGLE("Single"),
        MARRIED_FILING_JOINTLY("Married Filing Jointly"),
        MARRIED_FILING_SEPARATELY("Married Filing Separately"),
        HEAD_OF_HOUSEHOLD("Head of Household"),
        QUALIFYING_WIDOW("Qualifying Widow(er)");

        private final String displayName;

        UsFilingStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    /**
     * India Tax Regime options
     */
    public enum IndiaTaxRegime {
        OLD_REGIME("Old Regime"),
        NEW_REGIME("New Regime");

        private final String displayName;

        IndiaTaxRegime(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    /**
     * UK Student Loan Plan options
     */
    public enum UkStudentLoanPlan {
        PLAN1("Plan 1"),
        PLAN2("Plan 2"),
        PLAN4("Plan 4 (Scotland)"),
        POSTGRADUATE("Postgraduate Loan");

        private final String displayName;

        UkStudentLoanPlan(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    // ==================== Helper Methods ====================

    /**
     * Check if tax info is for a specific country
     */
    public boolean isForCountry(String countryCode) {
        return this.taxCountryCode != null && this.taxCountryCode.equalsIgnoreCase(countryCode);
    }

    /**
     * Get summary based on country
     */
    public String getTaxSummary() {
        if (taxCountryCode == null) return "No tax information";

        return switch (taxCountryCode.toUpperCase()) {
            case "USA" -> String.format("US: %s, %d allowances%s",
                usFilingStatus != null ? usFilingStatus : "Not set",
                usAllowances != null ? usAllowances : 0,
                Boolean.TRUE.equals(usExemptFromWithholding) ? " (Exempt)" : "");
            case "GBR" -> String.format("UK: Tax Code %s%s",
                ukTaxCode != null ? ukTaxCode : "Not set",
                ukStudentLoanPlan != null ? ", " + ukStudentLoanPlan : "");
            case "IND" -> String.format("India: %s regime, 80C: ₹%.0f",
                indTaxRegime != null ? indTaxRegime : "Not set",
                indSection80cDeclared != null ? indSection80cDeclared.doubleValue() : 0);
            case "CAN" -> String.format("Canada: %s, Claim: $%.0f",
                canProvinceCode != null ? canProvinceCode : "Not set",
                canTotalClaimAmount != null ? canTotalClaimAmount.doubleValue() : 0);
            case "AUS" -> String.format("Australia: %s%s",
                Boolean.TRUE.equals(ausTaxFreeThreshold) ? "Tax-free threshold claimed" : "No threshold",
                Boolean.TRUE.equals(ausHelpDebt) ? ", HELP debt" : "");
            default -> String.format("%s: Tax Year %d", taxCountry, taxYear);
        };
    }

    /**
     * Check if all required documents are submitted for the country
     */
    public boolean isDocumentationComplete() {
        if (taxCountryCode == null) return false;

        return switch (taxCountryCode.toUpperCase()) {
            case "USA" -> Boolean.TRUE.equals(usW4Submitted);
            case "CAN" -> Boolean.TRUE.equals(canTd1FederalSubmitted) && Boolean.TRUE.equals(canTd1ProvincialSubmitted);
            default -> Boolean.TRUE.equals(annualDeclarationSubmitted) || declarationDocument != null;
        };
    }
}
