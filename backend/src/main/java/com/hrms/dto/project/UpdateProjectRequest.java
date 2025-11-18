package com.hrms.dto.project;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class UpdateProjectRequest {
    private String projectName;
    private String projectType;
    private String description;

    // Timeline
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer estimatedDurationMonths;
    private String projectStatus;

    // Financial
    private BigDecimal projectBudget;
    private String billingRateType;
    private BigDecimal defaultBillingRate;

    // Management
    private UUID projectManagerId;

    // Status
    private Boolean isBillable;
    private Boolean isActive;
}
