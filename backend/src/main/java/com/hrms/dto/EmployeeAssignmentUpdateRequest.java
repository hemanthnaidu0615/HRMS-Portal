package com.hrms.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class EmployeeAssignmentUpdateRequest {
    private UUID departmentId;
    private UUID positionId;
    private UUID reportsToEmployeeId;
    private String employmentType;
    private UUID clientId;
    private UUID projectId;
    private LocalDate contractEndDate;
}
