package com.hrms.entity.employee;

import com.hrms.entity.Employee;
import com.hrms.entity.Organization;
import com.hrms.entity.User;
import com.hrms.entity.Document;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Employee Bank Account Entity
 * Country-Agnostic: Supports international banking systems
 * Includes routing codes for USA, India, UK, Australia, Canada, Mexico
 */
@Entity
@Table(name = "employee_bank_accounts")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeBankAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    // Account Type & Priority
    @Column(name = "account_purpose", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AccountPurpose accountPurpose = AccountPurpose.SALARY;

    @Column(name = "is_primary")
    @Builder.Default
    private Boolean isPrimary = false;

    @Column(name = "priority")
    @Builder.Default
    private Integer priority = 1;

    // Bank Details (Universal)
    @Column(name = "bank_name", nullable = false, length = 255)
    private String bankName;

    @Column(name = "bank_branch", length = 255)
    private String bankBranch;

    @Column(name = "bank_address", length = 500)
    private String bankAddress;

    @Column(name = "account_holder_name", nullable = false, length = 255)
    private String accountHolderName;

    @Column(name = "account_number", nullable = false, length = 100)
    private String accountNumber;

    @Column(name = "account_number_masked", length = 20)
    private String accountNumberMasked;

    @Column(name = "account_type", length = 50)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AccountType accountType = AccountType.CHECKING;

    // International Bank Identifiers
    @Column(name = "swift_code", length = 11)
    private String swiftCode; // SWIFT/BIC - International

    @Column(name = "iban", length = 34)
    private String iban; // Europe, Middle East

    // Country-Specific Routing Codes
    @Column(name = "routing_number", length = 20)
    private String routingNumber; // USA: ABA Routing Number

    @Column(name = "ifsc_code", length = 15)
    private String ifscCode; // India: IFSC Code

    @Column(name = "sort_code", length = 10)
    private String sortCode; // UK: Sort Code

    @Column(name = "bsb_code", length = 10)
    private String bsbCode; // Australia: BSB Code

    @Column(name = "transit_number", length = 10)
    private String transitNumber; // Canada: Transit Number

    @Column(name = "institution_number", length = 5)
    private String institutionNumber; // Canada: Institution Number

    @Column(name = "clabe", length = 20)
    private String clabe; // Mexico: CLABE

    // Country & Currency
    @Column(name = "bank_country", nullable = false, length = 100)
    @Builder.Default
    private String bankCountry = "United States";

    @Column(name = "bank_country_code", length = 3)
    private String bankCountryCode;

    @Column(name = "currency", nullable = false, length = 10)
    @Builder.Default
    private String currency = "USD";

    // Verification
    @Column(name = "verification_status", length = 50)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    @Column(name = "verification_method", length = 50)
    private String verificationMethod; // micro_deposit, bank_statement, void_check

    @Column(name = "verification_notes", length = 500)
    private String verificationNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proof_document_id")
    private Document proofDocument;

    // Salary Split (if multiple accounts)
    @Column(name = "split_type", length = 20)
    @Enumerated(EnumType.STRING)
    private SplitType splitType;

    @Column(name = "split_value", precision = 10, scale = 2)
    private BigDecimal splitValue;

    // Status
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "deactivated_at")
    private LocalDateTime deactivatedAt;

    @Column(name = "deactivation_reason", length = 255)
    private String deactivationReason;

    // Audit Fields
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (accountNumber != null) {
            accountNumberMasked = maskAccountNumber(accountNumber);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (accountNumber != null) {
            accountNumberMasked = maskAccountNumber(accountNumber);
        }
    }

    // Enums
    public enum AccountPurpose {
        SALARY,
        REIMBURSEMENT,
        BONUS,
        ALL
    }

    public enum AccountType {
        CHECKING,
        SAVINGS,
        CURRENT,
        SALARY
    }

    public enum VerificationStatus {
        PENDING,
        VERIFIED,
        FAILED,
        NEEDS_UPDATE
    }

    public enum SplitType {
        PERCENTAGE,
        FIXED_AMOUNT,
        REMAINDER
    }

    // Helper to mask account number
    private String maskAccountNumber(String number) {
        if (number == null || number.length() <= 4) {
            return "****";
        }
        String lastFour = number.substring(number.length() - 4);
        return "******" + lastFour;
    }

    // Get appropriate routing code based on country
    public String getRoutingCode() {
        if (bankCountryCode == null) return null;
        return switch (bankCountryCode) {
            case "USA" -> routingNumber;
            case "IND" -> ifscCode;
            case "GBR" -> sortCode;
            case "AUS" -> bsbCode;
            case "CAN" -> transitNumber + "-" + institutionNumber;
            case "MEX" -> clabe;
            default -> swiftCode;
        };
    }
}
