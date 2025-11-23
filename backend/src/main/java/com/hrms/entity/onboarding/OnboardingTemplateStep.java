package com.hrms.entity.onboarding;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Individual steps within an onboarding template
 */
@Entity
@Table(name = "onboarding_template_steps")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OnboardingTemplateStep {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private OnboardingTemplate template;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "depends_on_step_id")
    private OnboardingTemplateStep dependsOnStep;

    @Column(name = "step_number", nullable = false)
    private Integer stepNumber;

    @Column(name = "step_code", nullable = false, length = 50)
    private String stepCode;

    @Column(name = "step_name", nullable = false)
    private String stepName;

    @Column(name = "step_description", length = 1000)
    private String stepDescription;

    /**
     * Category determines the priority/requirement level
     * REQUIRED_ONBOARDING: Must complete to start work
     * REQUIRED_WEEK1: Complete within first week
     * REQUIRED_PAYROLL: Complete before first payroll
     * COMPLIANCE: Legal/regulatory requirements
     * IT_SETUP: System access, equipment
     * TRAINING: Learning & development
     * OPTIONAL: Nice to have
     */
    @Column(name = "category", nullable = false, length = 50)
    private String category;

    /**
     * Type of step
     */
    @Column(name = "step_type", nullable = false, length = 50)
    private String stepType = "task";

    // Timeline
    @Column(name = "due_by_days")
    private Integer dueByDays;

    @Column(name = "reminder_before_days")
    private Integer reminderBeforeDays;

    @Column(name = "escalation_after_days")
    private Integer escalationAfterDays;

    /**
     * Who is responsible for completing this step
     */
    @Column(name = "assigned_to", length = 50)
    private String assignedTo = "employee";

    @Column(name = "assigned_role", length = 100)
    private String assignedRole;

    // Settings
    @Column(name = "can_be_skipped")
    private Boolean canBeSkipped = false;

    @Column(name = "requires_approval")
    private Boolean requiresApproval = false;

    @Column(name = "auto_complete_on_data")
    private Boolean autoCompleteOnData = false;

    @Column(name = "related_table", length = 100)
    private String relatedTable;

    @Column(name = "related_field", length = 100)
    private String relatedField;

    // UI
    @Column(name = "icon", length = 50)
    private String icon;

    @Column(name = "color", length = 20)
    private String color;

    @Column(name = "help_url", length = 500)
    private String helpUrl;

    @Column(name = "is_active")
    private Boolean isActive = true;

    // Checklist items within this step
    @OneToMany(mappedBy = "step", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("itemOrder ASC")
    private List<OnboardingChecklistItem> checklistItems = new ArrayList<>();
}
