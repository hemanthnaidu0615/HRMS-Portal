package com.hrms.dto.project;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ProjectDetailResponse {
    private UUID id;
    private UUID clientId;
    private String clientName;

    // Project Info
    private String projectName;
    private String projectCode;
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
    private String currency;

    // Management
    private UUID projectManagerId;
    private String projectManagerName;

    // Metrics
    private Integer totalAllocatedResources;

    // Status
    private Boolean isBillable;
    private Boolean isActive;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
