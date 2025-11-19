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
 * PayrollRun Entity
 * Module: PAYROLL
 */
@Entity
@Table(name = "payroll_runs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayrollRun {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "organization_id")
    private UUID organizationId;

    @Column(name = "pay_period")
    private String payPeriod;

    @Column(name = "period_start")
    private LocalDate periodStart;

    @Column(name = "period_end")
    private LocalDate periodEnd;

    @Column(name = "status")
    private String status;

    @Column(name = "total_employees")
    private Integer totalEmployees;

    @Column(name = "total_gross_pay")
    private BigDecimal totalGrossPay;

    @Column(name = "total_deductions")
    private BigDecimal totalDeductions;

    @Column(name = "total_net_pay")
    private BigDecimal totalNetPay;

    @Column(name = "processed_by")
    private UUID processedBy;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
