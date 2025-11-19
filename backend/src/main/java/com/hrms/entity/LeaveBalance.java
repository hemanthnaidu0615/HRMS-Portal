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
 * LeaveBalance Entity
 * Module: LEAVE
 */
@Entity
@Table(name = "leave_balances")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveBalance {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "organization_id")
    private UUID organizationId;

    @Column(name = "employee_id")
    private UUID employeeId;

    @Column(name = "leave_type_id")
    private UUID leaveTypeId;

    @Column(name = "year")
    private Integer year;

    @Column(name = "total_quota")
    private BigDecimal totalQuota;

    @Column(name = "used")
    private BigDecimal used;

    @Column(name = "pending")
    private BigDecimal pending;

    @Column(name = "available")
    private BigDecimal available;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
