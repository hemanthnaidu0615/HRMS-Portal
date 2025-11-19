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
 * AttendanceRecord Entity
 * Module: ATTENDANCE
 */
@Entity
@Table(name = "attendance_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRecord {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "organization_id")
    private UUID organizationId;

    @Column(name = "employee_id")
    private UUID employeeId;

    @Column(name = "attendance_date")
    private LocalDate attendanceDate;

    @Column(name = "check_in")
    private LocalTime checkIn;

    @Column(name = "check_out")
    private LocalTime checkOut;

    @Column(name = "status")
    private String status;

    @Column(name = "worked_minutes")
    private Integer workedMinutes;

    @Column(name = "remarks")
    private String remarks;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
