package com.hrms.dto.employee.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Request DTO for creating a new employee during onboarding
 * Only contains REQUIRED fields for Step 1 (Basic Info)
 * Other fields are optional and can be added later
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateEmployeeOnboardingRequest {

    // ===============================================
    // STEP 1: BASIC INFO (REQUIRED AT ONBOARDING)
    // ===============================================

    @NotBlank(message = "First name is required")
    @Size(min = 1, max = 100, message = "First name must be between 1 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s'-]+$", message = "First name can only contain letters, spaces, hyphens and apostrophes")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 1, max = 100, message = "Last name must be between 1 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s'-]+$", message = "Last name can only contain letters, spaces, hyphens and apostrophes")
    private String lastName;

    @NotBlank(message = "Work email is required")
    @Email(message = "Please provide a valid email address")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String workEmail;

    @NotNull(message = "Joining date is required")
    @FutureOrPresent(message = "Joining date cannot be in the past")
    private LocalDate joiningDate;

    @NotBlank(message = "Employment type is required")
    @Pattern(regexp = "^(full_time|part_time|contractor|consultant|intern|temporary)$",
             message = "Employment type must be one of: full_time, part_time, contractor, consultant, intern, temporary")
    private String employmentType;

    // ===============================================
    // ORGANIZATIONAL ASSIGNMENT (Required at onboarding)
    // ===============================================

    @NotNull(message = "Department is required")
    private UUID departmentId;

    @NotNull(message = "Position is required")
    private UUID positionId;

    private UUID reportsTo; // Manager - optional at creation

    @NotBlank(message = "Work location is required")
    @Size(max = 255, message = "Work location must not exceed 255 characters")
    private String workLocation;

    @NotBlank(message = "Designation is required")
    @Size(max = 255, message = "Designation must not exceed 255 characters")
    private String designation;

    // ===============================================
    // OPTIONAL FIELDS (Can be added during onboarding)
    // ===============================================

    @Size(max = 100, message = "Middle name must not exceed 100 characters")
    private String middleName;

    @Size(max = 100, message = "Preferred name must not exceed 100 characters")
    private String preferredName;

    @Past(message = "Date of birth must be in the past")
    private java.time.LocalDate dateOfBirth;

    @Size(max = 20, message = "Gender must not exceed 20 characters")
    private String gender;

    @Size(max = 50, message = "Pronouns must not exceed 50 characters")
    private String pronouns;

    @Email(message = "Invalid personal email format")
    @Size(max = 255, message = "Personal email must not exceed 255 characters")
    private String personalEmail;

    @Size(max = 50, message = "Personal phone must not exceed 50 characters")
    private String personalPhone;

    @Pattern(regexp = "^(onsite|remote|hybrid)$", message = "Work arrangement must be onsite, remote, or hybrid")
    private String workArrangement;

    @Size(max = 100, message = "Time zone must not exceed 100 characters")
    private String timeZone;

    @Min(value = 0, message = "Notice period cannot be negative")
    @Max(value = 365, message = "Notice period cannot exceed 365 days")
    private Integer noticePeriodDays;

    // For contractors
    private UUID vendorId;
    private UUID clientId;
    private UUID projectId;
    private LocalDate contractStartDate;
    private LocalDate contractEndDate;

    // ===============================================
    // VALIDATION HELPER METHODS
    // ===============================================

    public boolean isContractor() {
        return "contractor".equals(employmentType) || "consultant".equals(employmentType);
    }

    // Custom validation: contractors must have vendor
    public boolean isValid() {
        if (isContractor() && vendorId == null) {
            return false;
        }
        if (contractEndDate != null && contractStartDate != null && contractEndDate.isBefore(contractStartDate)) {
            return false;
        }
        return true;
    }
}
