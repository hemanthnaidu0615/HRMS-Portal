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
 * AssetAssignment Entity
 * Module: ASSETS
 */
@Entity
@Table(name = "asset_assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssetAssignment {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "organization_id")
    private UUID organizationId;

    @Column(name = "asset_id")
    private UUID assetId;

    @Column(name = "employee_id")
    private UUID employeeId;

    @Column(name = "assigned_date")
    private LocalDate assignedDate;

    @Column(name = "returned_date")
    private LocalDate returnedDate;

    @Column(name = "status")
    private String status;

    @Column(name = "assignment_notes")
    private String assignmentNotes;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
