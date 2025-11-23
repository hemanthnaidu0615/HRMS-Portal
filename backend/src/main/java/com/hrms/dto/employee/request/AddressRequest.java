package com.hrms.dto.employee.request;

import jakarta.validation.constraints.*;
import lombok.*;

/**
 * Request DTO for employee address
 * Country-agnostic design
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressRequest {

    @NotBlank(message = "Address type is required")
    @Pattern(regexp = "^(CURRENT|PERMANENT|MAILING|WORK|TEMPORARY)$",
             message = "Address type must be CURRENT, PERMANENT, MAILING, WORK, or TEMPORARY")
    private String addressType;

    private Boolean isPrimary = false;

    @NotBlank(message = "Address line 1 is required")
    @Size(max = 255, message = "Address line 1 must not exceed 255 characters")
    private String addressLine1;

    @Size(max = 255, message = "Address line 2 must not exceed 255 characters")
    private String addressLine2;

    @Size(max = 255, message = "Address line 3 must not exceed 255 characters")
    private String addressLine3;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    @Size(max = 100, message = "State/Province must not exceed 100 characters")
    private String stateProvince;

    @Size(max = 20, message = "Postal code must not exceed 20 characters")
    private String postalCode;

    @NotBlank(message = "Country is required")
    @Size(max = 100, message = "Country must not exceed 100 characters")
    private String country;

    @Size(min = 2, max = 3, message = "Country code must be 2-3 characters (ISO format)")
    private String countryCode;

    private java.time.LocalDate effectiveFrom;

    private java.time.LocalDate effectiveTo;
}
