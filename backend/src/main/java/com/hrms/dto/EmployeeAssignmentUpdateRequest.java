package com.hrms.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class EmployeeAssignmentUpdateRequest {
    private UUID departmentId;
    private UUID positionId;
    private UUID reportsToEmployeeId;

    @Pattern(regexp = "internal|contract|client", message = "Employment type must be one of: internal, contract, client")
    private String employmentType;

    private UUID clientId;
    private UUID projectId;

    @Future(message = "Contract end date must be in the future")
    private LocalDate contractEndDate;
}
