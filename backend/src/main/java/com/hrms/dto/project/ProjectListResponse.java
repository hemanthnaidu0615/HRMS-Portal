package com.hrms.dto.project;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class ProjectListResponse {
    private UUID id;
    private String projectName;
    private String projectCode;
    private String projectType;
    private UUID clientId;
    private String clientName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String projectStatus;
    private BigDecimal projectBudget;
    private String currency;
    private Integer totalAllocatedResources;
    private UUID projectManagerId;
    private String projectManagerName;
    private Boolean isBillable;
    private Boolean isActive;
}
