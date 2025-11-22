package com.hrms.entity.onboarding;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.UUID;

/**
 * Individual checklist items within a step
 */
@Entity
@Table(name = "onboarding_checklist_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OnboardingChecklistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "step_id", nullable = false)
    private OnboardingTemplateStep step;

    @Column(name = "item_order", nullable = false)
    private Integer itemOrder;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(name = "item_description", length = 500)
    private String itemDescription;

    /**
     * Type of item:
     * FORM_FIELD: Data entry field
     * DOCUMENT_UPLOAD: File upload
     * ACKNOWLEDGEMENT: Checkbox/agreement
     * TASK: Manual task
     * VERIFICATION: Requires verification
     * INFO: Information only
     * LINK: External link
     * VIDEO: Training video
     */
    @Column(name = "item_type", nullable = false, length = 50)
    private String itemType;

    @Column(name = "related_field", length = 100)
    private String relatedField;

    @Column(name = "related_table", length = 100)
    private String relatedTable;

    @Column(name = "required_document_type", length = 50)
    private String requiredDocumentType;

    // For acknowledgements
    @Column(name = "acknowledgement_text", length = 2000)
    private String acknowledgementText;

    @Column(name = "requires_signature")
    private Boolean requiresSignature = false;

    // Validation
    @Column(name = "is_required")
    private Boolean isRequired = true;

    @Column(name = "validation_rule", length = 500)
    private String validationRule;

    @Column(name = "min_value", length = 100)
    private String minValue;

    @Column(name = "max_value", length = 100)
    private String maxValue;

    @Column(name = "regex_pattern", length = 255)
    private String regexPattern;

    // Help
    @Column(name = "help_text", length = 500)
    private String helpText;

    @Column(name = "example_text", length = 255)
    private String exampleText;

    @Column(name = "help_url", length = 500)
    private String helpUrl;
}
