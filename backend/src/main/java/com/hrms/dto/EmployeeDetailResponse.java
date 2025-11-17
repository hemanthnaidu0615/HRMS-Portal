package com.hrms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDetailResponse {
    private UUID employeeId;
    private UUID userId;
    private String email;
    private String firstName;
    private String lastName;

    private UUID departmentId;
    private String departmentName;

    private UUID positionId;
    private String positionName;

    private UUID reportsToEmployeeId;
    private String reportsToEmail;

    private String employmentType;
    private String clientName;  // For client employees
    private String projectId;   // For contract/project employees
    private LocalDate contractEndDate;

    // Probation period
    private Boolean isProbation;
    private LocalDate probationStartDate;
    private LocalDate probationEndDate;
    private String probationStatus;
}
