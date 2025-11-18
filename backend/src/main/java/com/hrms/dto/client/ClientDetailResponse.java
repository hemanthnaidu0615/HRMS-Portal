package com.hrms.dto.client;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ClientDetailResponse {
    private UUID id;
    private String name;
    private String clientCode;
    private String clientType;
    private String industry;

    // Contact
    private String primaryContactName;
    private String primaryContactEmail;
    private String primaryContactPhone;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String country;
    private String postalCode;

    // Business
    private String taxId;
    private String website;

    // Relationship
    private LocalDate relationshipStartDate;
    private String relationshipStatus;
    private UUID accountManagerId;
    private String accountManagerName;

    // Metrics
    private Integer totalActiveProjects;
    private Integer totalActiveResources;

    // Status
    private Boolean isActive;
    private Boolean isStrategic;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
