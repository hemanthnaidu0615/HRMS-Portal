package com.hrms.entity.employee;

import com.hrms.entity.Employee;
import com.hrms.entity.Organization;
import com.hrms.entity.User;
import com.hrms.entity.Document;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Employee Identity Document Entity
 * Country-Agnostic: Stores any type of identity document for any country
 * Links to IdentityDocumentType for metadata
 */
@Entity
@Table(name = "employee_identity_documents")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeIdentityDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_type_id", nullable = false)
    private IdentityDocumentType documentType;

    // Document Details
    @Column(name = "document_number", nullable = false, length = 100)
    private String documentNumber; // The actual ID number

    @Column(name = "document_number_masked", length = 20)
    private String documentNumberMasked; // Masked: ***-**-1234

    // Issuing Details
    @Column(name = "issuing_authority", length = 255)
    private String issuingAuthority;

    @Column(name = "issuing_country", length = 100)
    private String issuingCountry;

    @Column(name = "issuing_state", length = 100)
    private String issuingState; // For state-issued docs like US Driver's License

    // Dates
    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    // Verification Status
    @Column(name = "verification_status", length = 50)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    @Column(name = "verification_notes", length = 500)
    private String verificationNotes;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    // Document Proof (uploaded scans)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_file_id")
    private Document documentFile;

    @Column(name = "document_front_url", length = 500)
    private String documentFrontUrl;

    @Column(name = "document_back_url", length = 500)
    private String documentBackUrl;

    // Flags
    @Column(name = "is_primary_tax_id")
    @Builder.Default
    private Boolean isPrimaryTaxId = false;

    @Column(name = "is_work_authorization")
    @Builder.Default
    private Boolean isWorkAuthorization = false;

    @Column(name = "used_for_i9")
    @Builder.Default
    private Boolean usedForI9 = false; // US I-9 verification

    // Expiry Alerts
    @Column(name = "expiry_reminder_sent")
    @Builder.Default
    private Boolean expiryReminderSent = false;

    @Column(name = "expiry_reminder_date")
    private LocalDateTime expiryReminderDate;

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
        if (documentNumber != null) {
            documentNumberMasked = maskDocumentNumber(documentNumber);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (documentNumber != null) {
            documentNumberMasked = maskDocumentNumber(documentNumber);
        }
    }

    // Verification Status Enum
    public enum VerificationStatus {
        PENDING,
        VERIFIED,
        REJECTED,
        EXPIRED,
        NEEDS_UPDATE
    }

    // Helper method to mask document number
    private String maskDocumentNumber(String number) {
        if (number == null || number.length() <= 4) {
            return "****";
        }
        String lastFour = number.substring(number.length() - 4);
        return "***" + lastFour;
    }

    // Check if document is expired
    public boolean isExpired() {
        return expiryDate != null && expiryDate.isBefore(LocalDate.now());
    }

    // Check if expiring soon (within 30 days)
    public boolean isExpiringSoon() {
        if (expiryDate == null) return false;
        return expiryDate.isBefore(LocalDate.now().plusDays(30)) && !isExpired();
    }

    // Check if expiring within given days
    public boolean isExpiringWithinDays(int days) {
        if (expiryDate == null) return false;
        return expiryDate.isBefore(LocalDate.now().plusDays(days)) && !isExpired();
    }
}
