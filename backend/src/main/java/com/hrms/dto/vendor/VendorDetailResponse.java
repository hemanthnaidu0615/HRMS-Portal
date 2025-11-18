package com.hrms.dto.vendor;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class VendorDetailResponse {
    private UUID id;
    private String name;
    private String vendorCode;
    private String vendorType;

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
    private String businessRegistrationNumber;
    private String website;

    // Contract
    private LocalDate contractStartDate;
    private LocalDate contractEndDate;
    private String contractStatus;

    // Billing
    private String billingType;
    private BigDecimal defaultBillingRate;
    private String billingCurrency;
    private String paymentTerms;

    // Multi-tier
    private UUID parentVendorId;
    private String parentVendorName;
    private Integer tierLevel;

    // Metrics
    private Integer totalResourcesSupplied;
    private Integer activeResourcesCount;

    // Status
    private Boolean isActive;
    private Boolean isPreferred;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
