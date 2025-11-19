package com.hrms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * EmployeeGoal Entity
 * Module: PERFORMANCE
 */
@Entity
@Table(name = "employee_goals")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeGoal {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "organization_id")
    private UUID organizationId;

    @Column(name = "employee_id")
    private UUID employeeId;

    @Column(name = "cycle_id")
    private UUID cycleId;

    @Column(name = "title")
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(name = "status")
    private String status;

    @Column(name = "progress_percentage")
    private Integer progressPercentage;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
