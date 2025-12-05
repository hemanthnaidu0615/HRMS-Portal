package com.hrms.entity.timesheet;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.*;
import java.math.BigDecimal;
import java.util.UUID;

import com.hrms.entity.*;

@Entity
@Table(name = "timesheet_summaries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimesheetSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "[year]", nullable = false)
    private Integer year;

    @Column(name = "[month]", nullable = false)
    private Integer month;

    @Column(name = "week_number")
    private Integer weekNumber;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @Column(name = "total_hours", precision = 10, scale = 2)
    private BigDecimal totalHours;

    @Column(name = "billable_hours", precision = 10, scale = 2)
    private BigDecimal billableHours;

    @Column(name = "non_billable_hours", precision = 10, scale = 2)
    private BigDecimal nonBillableHours;

    @Column(name = "overtime_hours", precision = 10, scale = 2)
    private BigDecimal overtimeHours;

    @Column(name = "leave_hours", precision = 10, scale = 2)
    private BigDecimal leaveHours;

    @Column(name = "holiday_hours", precision = 10, scale = 2)
    private BigDecimal holidayHours;

    @Column(name = "status", length = 20)
    private String status = "DRAFT";

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(name = "is_active")
    private Boolean isActive = true;

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

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
        if (status == null) {
            status = "DRAFT";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
