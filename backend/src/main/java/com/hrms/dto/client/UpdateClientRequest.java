package com.hrms.dto.client;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class UpdateClientRequest {
    private String name;
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

    // Status
    private Boolean isActive;
    private Boolean isStrategic;
}
