package com.hrms.dto.employee.request;

import jakarta.validation.constraints.*;
import lombok.*;

/**
 * Request DTO for employee emergency contact
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyContactRequest {

    @Min(value = 1, message = "Priority must be at least 1")
    @Max(value = 10, message = "Priority cannot exceed 10")
    private Integer priority = 1;

    private Boolean isPrimary = false;

    @NotBlank(message = "Contact name is required")
    @Size(max = 255, message = "Contact name must not exceed 255 characters")
    private String contactName;

    @NotBlank(message = "Relationship is required")
    @Pattern(regexp = "^(SPOUSE|PARTNER|PARENT|MOTHER|FATHER|SIBLING|BROTHER|SISTER|CHILD|SON|DAUGHTER|GRANDPARENT|UNCLE|AUNT|COUSIN|NEPHEW|NIECE|FRIEND|COLLEAGUE|NEIGHBOR|GUARDIAN|OTHER)$",
             message = "Invalid relationship type")
    private String relationship;

    @NotBlank(message = "Primary phone is required")
    @Pattern(regexp = "^[+]?[0-9\\s\\-()]{7,20}$", message = "Invalid phone number format")
    private String primaryPhone;

    @Pattern(regexp = "^[+]?[0-9\\s\\-()]{7,20}$", message = "Invalid phone number format")
    private String secondaryPhone;

    @Size(max = 5, message = "Phone country code must not exceed 5 characters")
    private String phoneCountryCode;

    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    // Optional address
    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String addressLine1;

    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    @Size(max = 100, message = "State/Province must not exceed 100 characters")
    private String stateProvince;

    @Size(max = 20, message = "Postal code must not exceed 20 characters")
    private String postalCode;

    @Size(max = 100, message = "Country must not exceed 100 characters")
    private String country;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;

    @Size(max = 100, message = "Best time to contact must not exceed 100 characters")
    private String bestTimeToContact;

    @Size(max = 255, message = "Languages must not exceed 255 characters")
    private String speaksLanguages;
}
