package com.hrms.entity.onboarding;

import com.hrms.entity.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Individual step status for an employee's onboarding
 */
@Entity
@Table(name = "employee_onboarding_step_status")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeOnboardingStepStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "onboarding_progress_id", nullable = false)
    private EmployeeOnboardingProgress onboardingProgress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "step_id", nullable = false)
    private OnboardingTemplateStep step;

    /**
     * Status: PENDING, IN_PROGRESS, COMPLETED, SKIPPED, BLOCKED, NOT_APPLICABLE
     */
    @Column(name = "status", nullable = false, length = 50)
    private String status = "PENDING";

    @Column(name = "percentage")
    private Integer percentage = 0;

    // Timeline
    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "is_overdue")
    private Boolean isOverdue = false;

    // Completion
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "completed_by")
    private User completedBy;

    @Column(name = "completion_notes", length = 500)
    private String completionNotes;

    // JSON data for completed items
    @Column(name = "completion_data", columnDefinition = "NVARCHAR(MAX)")
    private String completionData;

    // Blocking
    @Column(name = "blocked_reason", length = 500)
    private String blockedReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blocked_by_step_id")
    private OnboardingTemplateStep blockedByStep;

    // Audit
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        checkOverdue();
    }

    public void checkOverdue() {
        if (dueDate != null && !"COMPLETED".equals(status) && !"SKIPPED".equals(status)) {
            this.isOverdue = LocalDate.now().isAfter(dueDate);
        }
    }

    public void markCompleted(User user) {
        this.status = "COMPLETED";
        this.completedAt = LocalDateTime.now();
        this.completedBy = user;
        this.percentage = 100;
        this.isOverdue = false;
    }

    public void markInProgress() {
        if ("PENDING".equals(this.status)) {
            this.status = "IN_PROGRESS";
            this.startedAt = LocalDateTime.now();
        }
    }
}
