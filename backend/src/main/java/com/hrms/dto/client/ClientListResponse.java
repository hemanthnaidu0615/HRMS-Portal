package com.hrms.dto.client;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class ClientListResponse {
    private UUID id;
    private String name;
    private String clientCode;
    private String clientType;
    private String industry;
    private String primaryContactName;
    private String primaryContactEmail;
    private String primaryContactPhone;
    private String relationshipStatus;
    private LocalDate relationshipStartDate;
    private Integer totalActiveProjects;
    private Integer totalActiveResources;
    private Boolean isActive;
    private Boolean isStrategic;
}
