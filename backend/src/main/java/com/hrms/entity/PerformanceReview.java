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
 * PerformanceReview Entity
 * Module: PERFORMANCE
 */
@Entity
@Table(name = "performance_reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceReview {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "organization_id")
    private UUID organizationId;

    @Column(name = "cycle_id")
    private UUID cycleId;

    @Column(name = "employee_id")
    private UUID employeeId;

    @Column(name = "reviewer_id")
    private UUID reviewerId;

    @Column(name = "review_type")
    private String reviewType;

    @Column(name = "overall_rating")
    private Integer overallRating;

    @Column(name = "comments")
    private String comments;

    @Column(name = "status")
    private String status;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
