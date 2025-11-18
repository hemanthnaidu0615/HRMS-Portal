package com.hrms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Employee Code Sequence Entity
 * Manages department-based sequential employee codes (e.g., IT001, HR001, FIN001)
 */
@Entity
@Table(name = "employee_code_sequences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeCodeSequence {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(name = "prefix", length = 20, nullable = false)
    private String prefix;

    @Column(name = "current_number", nullable = false)
    private Integer currentNumber;

    public EmployeeCodeSequence(Organization organization, Department department, String prefix, Integer currentNumber) {
        this.organization = organization;
        this.department = department;
        this.prefix = prefix;
        this.currentNumber = currentNumber;
    }
}
