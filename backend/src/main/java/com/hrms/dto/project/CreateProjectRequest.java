package com.hrms.dto.project;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class CreateProjectRequest {
    private UUID clientId;
    private String projectName;
    private String projectCode; // Optional - auto-generated if not provided
    private String projectType;
    private String description;

    // Timeline
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer estimatedDurationMonths;

    // Financial
    private BigDecimal projectBudget;
    private String billingRateType;
    private BigDecimal defaultBillingRate;

    // Management
    private UUID projectManagerId;

    // Status
    private Boolean isBillable;
}
