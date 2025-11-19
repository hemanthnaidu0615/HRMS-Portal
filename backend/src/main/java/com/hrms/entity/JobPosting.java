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
 * JobPosting Entity
 * Module: RECRUITMENT
 */
@Entity
@Table(name = "job_postings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobPosting {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "organization_id")
    private UUID organizationId;

    @Column(name = "title")
    private String title;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "position_id")
    private UUID positionId;

    @Column(name = "employment_type")
    private String employmentType;

    @Column(name = "experience_level")
    private String experienceLevel;

    @Column(name = "description")
    private String description;

    @Column(name = "status")
    private String status;

    @Column(name = "posting_date")
    private LocalDate postingDate;

    @Column(name = "closing_date")
    private LocalDate closingDate;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
