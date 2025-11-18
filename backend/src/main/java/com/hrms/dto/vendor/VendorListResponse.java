package com.hrms.dto.vendor;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class VendorListResponse {
    private UUID id;
    private String name;
    private String vendorCode;
    private String vendorType;
    private String primaryContactName;
    private String primaryContactEmail;
    private String primaryContactPhone;
    private String contractStatus;
    private LocalDate contractStartDate;
    private LocalDate contractEndDate;
    private BigDecimal defaultBillingRate;
    private String billingCurrency;
    private Integer totalResourcesSupplied;
    private Integer activeResourcesCount;
    private Boolean isActive;
    private Boolean isPreferred;
}
