package com.hrms.entity.onboarding;

import com.hrms.entity.Department;
import com.hrms.entity.Organization;
import com.hrms.entity.Position;
import com.hrms.entity.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Reusable onboarding workflow templates
 * Inspired by BambooHR's customizable onboarding checklists
 */
@Entity
@Table(name = "onboarding_templates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OnboardingTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(name = "template_name", nullable = false)
    private String templateName;

    @Column(name = "template_code", nullable = false, length = 50)
    private String templateCode;

    @Column(name = "description", length = 1000)
    private String description;

    // Targeting - which employees get this template
    @Column(name = "employment_type", length = 50)
    private String employmentType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(name = "country_code", length = 3)
    private String countryCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_id")
    private Position position;

    // Settings
    @Column(name = "target_completion_days")
    private Integer targetCompletionDays = 30;

    @Column(name = "auto_assign")
    private Boolean autoAssign = false;

    @Column(name = "send_welcome_email")
    private Boolean sendWelcomeEmail = true;

    @Column(name = "allow_self_service")
    private Boolean allowSelfService = true;

    // Status
    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "is_default")
    private Boolean isDefault = false;

    // Audit
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    // Steps
    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("stepNumber ASC")
    private List<OnboardingTemplateStep> steps = new ArrayList<>();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
