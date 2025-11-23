package com.hrms.model;

import com.hrms.entity.Organization;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "permissions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String resource; // e.g., "employees", "payroll", "documents"

    @Column(nullable = false, length = 100)
    private String action; // e.g., "view", "edit", "create", "delete", "approve"

    @Column(nullable = false, length = 50)
    private String scope; // "own", "team", "department", "organization", "global"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization; // NULL for global permissions

    @Column(length = 500)
    private String description; // Technical description

    @Column(name = "friendly_name", length = 200)
    private String friendlyName; // User-friendly name (e.g., "View My Payroll")
}
