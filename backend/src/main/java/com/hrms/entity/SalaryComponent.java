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
 * SalaryComponent Entity
 * Module: PAYROLL
 */
@Entity
@Table(name = "salary_components")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalaryComponent {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "organization_id")
    private UUID organizationId;

    @Column(name = "name")
    private String name;

    @Column(name = "code")
    private String code;

    @Column(name = "type")
    private String type;

    @Column(name = "calculation_type")
    private String calculationType;

    @Column(name = "is_active")
    private Boolean isActive;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
