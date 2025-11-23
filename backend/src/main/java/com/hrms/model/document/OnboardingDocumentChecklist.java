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

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "onboarding_document_checklists")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OnboardingDocumentChecklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    // Checklist Item
    @Column(name = "checklist_item_name", nullable = false, length = 200)
    private String checklistItemName;

    @Column(name = "checklist_item_type", length = 100)
    @Enumerated(EnumType.STRING)
    private ChecklistItemType checklistItemType;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Linked Document
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_to_sign_id")
    private EmployeeDocumentToSign documentToSign;

    // Status
    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private ChecklistStatus status = ChecklistStatus.PENDING;

    @Column(name = "is_mandatory", nullable = false)
    private Boolean isMandatory = true;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "completed_by")
    private User completedBy;

    // Display Order
    @Column(name = "display_order")
    private Integer displayOrder = 0;

    // Notes
    @Column(columnDefinition = "TEXT")
    private String notes;

    // Audit
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum ChecklistItemType {
        UPLOAD_PHOTO,
        UPLOAD_ID_PROOF,
        UPLOAD_ADDRESS_PROOF,
        SIGN_OFFER_LETTER,
        SIGN_CONTRACT,
        SIGN_NDA,
        SIGN_HANDBOOK,
        SIGN_CODE_OF_CONDUCT,
        COMPLETE_TAX_FORM,
        ENROLL_BENEFITS,
        SETUP_DIRECT_DEPOSIT,
        EMERGENCY_CONTACT_INFO,
        CUSTOM
    }

    public enum ChecklistStatus {
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        SKIPPED,
        NA
    }
}
