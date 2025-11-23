package com.hrms.model.document;

import com.hrms.entity.Organization;
import com.hrms.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "document_templates")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    // Template Details
    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "document_type", nullable = false, length = 100)
    @Enumerated(EnumType.STRING)
    private DocumentType documentType;

    // Template Content
    @Column(name = "template_content", columnDefinition = "TEXT")
    private String templateContent; // HTML with placeholders

    @Column(name = "file_storage_path", length = 500)
    private String fileStoragePath; // Path to stored template file

    @Column(name = "file_type", length = 50)
    private String fileType; // pdf, docx, html

    // Signing Configuration
    @Column(name = "requires_signature", nullable = false)
    private Boolean requiresSignature = true;

    @Column(name = "signature_required_from", length = 50)
    @Enumerated(EnumType.STRING)
    private SignatureRequiredFrom signatureRequiredFrom;

    @Column(name = "auto_send_on_hire", nullable = false)
    private Boolean autoSendOnHire = false;

    @Column(name = "send_order")
    private Integer sendOrder = 1;

    // Status
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Audit
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public enum DocumentType {
        OFFER_LETTER,
        EMPLOYMENT_CONTRACT,
        NDA,
        EMPLOYEE_HANDBOOK,
        BENEFITS_ENROLLMENT,
        TAX_FORM,
        POLICY_ACKNOWLEDGMENT,
        CODE_OF_CONDUCT,
        CONTRACTOR_AGREEMENT,
        EXIT_PAPERWORK,
        CUSTOM
    }

    public enum SignatureRequiredFrom {
        EMPLOYEE,
        EMPLOYER,
        BOTH,
        MULTIPLE
    }
}
