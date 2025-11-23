package com.hrms.entity.employee;

import com.hrms.entity.Organization;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Identity Document Type Reference Entity
 * Country-Agnostic: Stores all types of identity documents globally
 * Pre-seeded with common documents for USA, India, UK, Canada, Australia, Germany
 */
@Entity
@Table(name = "identity_document_types")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IdentityDocumentType {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization; // NULL = system-wide, non-null = org-specific

    // Document Type Details
    @Column(name = "document_type_code", nullable = false, length = 50)
    private String documentTypeCode; // SSN, PAN, NI_NUMBER, TFN, SIN, etc.

    @Column(name = "document_type_name", nullable = false, length = 255)
    private String documentTypeName; // Full name

    @Column(name = "description", length = 500)
    private String description;

    // Country Association
    @Column(name = "country_code", length = 3)
    private String countryCode; // ISO 3166-1 alpha-3: USA, IND, GBR, AUS, CAN, DEU

    @Column(name = "country_name", length = 100)
    private String countryName;

    // Validation
    @Column(name = "format_regex", length = 255)
    private String formatRegex; // Regex for validation

    @Column(name = "format_example", length = 100)
    private String formatExample; // Example format

    @Column(name = "max_length")
    private Integer maxLength;

    @Column(name = "min_length")
    private Integer minLength;

    // Requirements
    @Column(name = "is_required_for_onboarding")
    @Builder.Default
    private Boolean requiredForOnboarding = false;

    @Column(name = "is_required_for_payroll")
    @Builder.Default
    private Boolean requiredForPayroll = false;

    @Column(name = "is_required_for_tax")
    @Builder.Default
    private Boolean requiredForTax = false;

    @Column(name = "is_required_for_work_auth")
    @Builder.Default
    private Boolean requiredForWorkAuth = false;

    @Column(name = "is_government_issued")
    @Builder.Default
    private Boolean governmentIssued = true;

    @Column(name = "has_expiry_date")
    @Builder.Default
    private Boolean hasExpiryDate = false;

    @Column(name = "is_universal")
    @Builder.Default
    private Boolean universal = false;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    // Category
    @Column(name = "category", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private DocumentCategory category;

    // Status
    @Column(name = "is_active")
    @Builder.Default
    private Boolean active = true;

    @Column(name = "is_system_type")
    @Builder.Default
    private Boolean systemType = true; // false = custom org-defined

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // ==================== Helper Methods ====================

    /**
     * @return The document code
     */
    public String getDocumentCode() {
        return documentTypeCode;
    }

    /**
     * @return The display name
     */
    public String getDisplayName() {
        return documentTypeName;
    }

    /**
     * @return The validation pattern (regex)
     */
    public String getValidationPattern() {
        return formatRegex;
    }

    // Document Categories
    public enum DocumentCategory {
        TAX_ID,        // SSN, PAN, NI Number, TFN, SIN, Steuer-ID
        NATIONAL_ID,   // Aadhaar, Voter ID
        WORK_AUTH,     // EAD, Green Card, BRP, PR Card, Work Permit
        DRIVING,       // Driver's License
        PASSPORT,      // Passport
        VISA,          // Work Visa, Tourist Visa
        OTHER          // Custom documents
    }

    // Static factory methods for common document types
    public static IdentityDocumentType createUSASSN() {
        return IdentityDocumentType.builder()
            .documentTypeCode("SSN")
            .documentTypeName("Social Security Number")
            .countryCode("USA")
            .countryName("United States")
            .formatRegex("^\\d{3}-?\\d{2}-?\\d{4}$")
            .formatExample("XXX-XX-XXXX")
            .category(DocumentCategory.TAX_ID)
            .requiredForPayroll(true)
            .requiredForTax(true)
            .hasExpiryDate(false)
            .build();
    }

    public static IdentityDocumentType createIndiaPAN() {
        return IdentityDocumentType.builder()
            .documentTypeCode("PAN")
            .documentTypeName("Permanent Account Number")
            .countryCode("IND")
            .countryName("India")
            .formatRegex("^[A-Z]{5}[0-9]{4}[A-Z]$")
            .formatExample("ABCDE1234F")
            .category(DocumentCategory.TAX_ID)
            .requiredForPayroll(true)
            .requiredForTax(true)
            .hasExpiryDate(false)
            .build();
    }

    public static IdentityDocumentType createUKNINumber() {
        return IdentityDocumentType.builder()
            .documentTypeCode("NI_NUMBER")
            .documentTypeName("National Insurance Number")
            .countryCode("GBR")
            .countryName("United Kingdom")
            .formatRegex("^[A-Z]{2}[0-9]{6}[A-Z]$")
            .formatExample("AB123456C")
            .category(DocumentCategory.TAX_ID)
            .requiredForPayroll(true)
            .requiredForTax(true)
            .hasExpiryDate(false)
            .build();
    }
}
