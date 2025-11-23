package com.hrms.model.document;

import com.hrms.entity.Employee;
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
@Table(name = "employee_documents_to_sign")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDocumentToSign {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    private DocumentTemplate template; // Null if uploaded directly

    // Document Details
    @Column(name = "document_name", nullable = false, length = 200)
    private String documentName;

    @Column(name = "document_type", nullable = false, length = 100)
    private String documentType;

    @Column(columnDefinition = "TEXT")
    private String description;

    // File Storage
    @Column(name = "file_storage_path", nullable = false, length = 500)
    private String fileStoragePath;

    @Column(name = "file_type", nullable = false, length = 50)
    private String fileType; // pdf, docx

    @Column(name = "file_size_kb")
    private Integer fileSizeKb;

    // Signing Workflow
    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private DocumentStatus status = DocumentStatus.PENDING;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "viewed_at")
    private LocalDateTime viewedAt;

    @Column(name = "signed_at")
    private LocalDateTime signedAt;

    @Column(name = "declined_at")
    private LocalDateTime declinedAt;

    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    // Employee Signature
    @Column(name = "employee_signature_data", columnDefinition = "TEXT")
    private String employeeSignatureData; // Base64 encoded signature

    @Column(name = "employee_signature_ip", length = 50)
    private String employeeSignatureIp;

    @Column(name = "employee_signature_location", length = 200)
    private String employeeSignatureLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_signed_by")
    private User employeeSignedBy;

    // Employer Signature (for contracts needing both parties)
    @Column(name = "employer_signature_required", nullable = false)
    private Boolean employerSignatureRequired = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_signed_by")
    private User employerSignedBy;

    @Column(name = "employer_signature_data", columnDefinition = "TEXT")
    private String employerSignatureData;

    @Column(name = "employer_signed_at")
    private LocalDateTime employerSignedAt;

    // Tracking
    @Column(name = "reminder_sent_count")
    private Integer reminderSentCount = 0;

    @Column(name = "last_reminder_sent")
    private LocalDateTime lastReminderSent;

    // Notes
    @Column(name = "decline_reason", columnDefinition = "TEXT")
    private String declineReason;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

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

    public enum DocumentStatus {
        DRAFT,
        PENDING,
        SENT,
        VIEWED,
        SIGNED,
        DECLINED,
        EXPIRED,
        CANCELLED,
        COMPLETED
    }
}
