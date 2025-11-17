package com.hrms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeSummaryResponse {
    private UUID employeeId;
    private UUID userId;
    private String email;
    private String departmentName;
    private String positionName;
    private UUID reportsToEmployeeId;
    private String reportsToEmail;
    private String employmentType;
    private LocalDate contractEndDate;
    private Boolean isProbation;
    private LocalDate probationEndDate;
    private String probationStatus;
}
