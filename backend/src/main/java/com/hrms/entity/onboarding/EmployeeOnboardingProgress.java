package com.hrms.entity.onboarding;

import com.hrms.entity.Employee;
import com.hrms.entity.Organization;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Tracks individual employee's onboarding progress
 * Inspired by Rippling's unified data tracking
 */
@Entity
@Table(name = "employee_onboarding_progress")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeOnboardingProgress {

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
    @JoinColumn(name = "template_id", nullable = false)
    private OnboardingTemplate template;

    /**
     * Status: NOT_STARTED, IN_PROGRESS, COMPLETED, ON_HOLD, CANCELLED
     */
    @Column(name = "overall_status", nullable = false, length = 50)
    private String overallStatus = "NOT_STARTED";

    @Column(name = "overall_percentage")
    private Integer overallPercentage = 0;

    // Timeline
    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "target_completion_date")
    private LocalDate targetCompletionDate;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // Assignment
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hr_assignee_id")
    private Employee hrAssignee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buddy_id")
    private Employee buddy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private Employee manager;

    // Metrics
    @Column(name = "total_steps")
    private Integer totalSteps = 0;

    @Column(name = "completed_steps")
    private Integer completedSteps = 0;

    @Column(name = "pending_steps")
    private Integer pendingSteps = 0;

    @Column(name = "overdue_steps")
    private Integer overdueSteps = 0;

    @Column(name = "skipped_steps")
    private Integer skippedSteps = 0;

    // JSON progress data
    @Column(name = "steps_progress", columnDefinition = "NVARCHAR(MAX)")
    private String stepsProgress;

    // Feedback
    @Column(name = "hr_notes", length = 2000)
    private String hrNotes;

    @Column(name = "employee_feedback", length = 2000)
    private String employeeFeedback;

    @Column(name = "feedback_rating")
    private Integer feedbackRating;

    @Column(name = "feedback_submitted_at")
    private LocalDateTime feedbackSubmittedAt;

    // Audit
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Step statuses
    @OneToMany(mappedBy = "onboardingProgress", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EmployeeOnboardingStepStatus> stepStatuses = new ArrayList<>();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        updateMetrics();
    }

    public void updateMetrics() {
        if (stepStatuses != null && !stepStatuses.isEmpty()) {
            this.totalSteps = stepStatuses.size();
            this.completedSteps = (int) stepStatuses.stream()
                    .filter(s -> "COMPLETED".equals(s.getStatus()))
                    .count();
            this.pendingSteps = (int) stepStatuses.stream()
                    .filter(s -> "PENDING".equals(s.getStatus()) || "IN_PROGRESS".equals(s.getStatus()))
                    .count();
            this.overdueSteps = (int) stepStatuses.stream()
                    .filter(EmployeeOnboardingStepStatus::getIsOverdue)
                    .count();
            this.skippedSteps = (int) stepStatuses.stream()
                    .filter(s -> "SKIPPED".equals(s.getStatus()))
                    .count();

            this.overallPercentage = totalSteps > 0
                    ? (completedSteps * 100) / totalSteps
                    : 0;
        }
    }
}
