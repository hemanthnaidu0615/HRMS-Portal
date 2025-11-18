package com.hrms.dto.vendor;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class UpdateVendorRequest {
    private String name;
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
    private String paymentTerms;

    // Multi-tier
    private UUID parentVendorId;

    // Status
    private Boolean isActive;
    private Boolean isPreferred;
}
