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
 * AttendanceRegularization Entity
 * Module: ATTENDANCE
 */
@Entity
@Table(name = "attendance_regularization_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRegularization {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "organization_id")
    private UUID organizationId;

    @Column(name = "employee_id")
    private UUID employeeId;

    @Column(name = "attendance_date")
    private LocalDate attendanceDate;

    @Column(name = "requested_check_in")
    private LocalTime requestedCheckIn;

    @Column(name = "requested_check_out")
    private LocalTime requestedCheckOut;

    @Column(name = "reason")
    private String reason;

    @Column(name = "status")
    private String status;

    @Column(name = "approved_by")
    private UUID approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
