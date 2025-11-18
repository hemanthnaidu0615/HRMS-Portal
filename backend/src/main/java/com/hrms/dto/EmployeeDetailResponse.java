package com.hrms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Comprehensive Employee Detail Response with all 60+ fields
 * Aligned with Employee entity schema
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDetailResponse {
    // Basic IDs
    private UUID employeeId;
    private UUID userId;
    private String email;
    private UUID organizationId;

    // Employee Code
    private String employeeCode;

    // Personal Details (14 fields)
    private String firstName;
    private String middleName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String gender;
    private String nationality;
    private String maritalStatus;
    private String bloodGroup;

    // Contact Information (4 fields)
    private String personalEmail;
    private String phoneNumber;
    private String workPhone;
    private String alternatePhone;

    // Current Address (6 fields)
    private String currentAddressLine1;
    private String currentAddressLine2;
    private String currentCity;
    private String currentState;
    private String currentCountry;
    private String currentPostalCode;

    // Permanent Address (7 fields)
    private Boolean sameAsCurrentAddress;
    private String permanentAddressLine1;
    private String permanentAddressLine2;
    private String permanentCity;
    private String permanentState;
    private String permanentCountry;
    private String permanentPostalCode;

    // Emergency Contacts (6 fields)
    private String emergencyContactName;
    private String emergencyContactRelationship;
    private String emergencyContactPhone;
    private String alternateEmergencyContactName;
    private String alternateEmergencyContactRelationship;
    private String alternateEmergencyContactPhone;

    // Employment Details (11 fields)
    private LocalDate joiningDate;
    private String employmentStatus;
    private String employmentType;

    // Department & Position
    private UUID departmentId;
    private String departmentName;
    private String departmentCode;
    private UUID positionId;
    private String positionName;

    // Reporting
    private UUID reportsToEmployeeId;
    private String reportsToEmail;
    private String reportsToFirstName;
    private String reportsToLastName;

    // Vendor/Client/Project Assignment
    private UUID vendorId;
    private String vendorName;
    private String vendorCode;
    private UUID clientId;
    private String clientName;
    private String clientCode;
    private UUID projectId;
    private String projectName;
    private String projectCode;

    // Contract Details
    private LocalDate contractStartDate;
    private LocalDate contractEndDate;

    // Probation Period (5 fields)
    private Boolean isProbation;
    private LocalDate probationStartDate;
    private LocalDate probationEndDate;
    private String probationStatus;

    // Compensation (6 fields)
    private BigDecimal basicSalary;
    private String currency;
    private String payFrequency;

    // Bank Details (6 fields)
    private String bankAccountNumber;
    private String bankName;
    private String bankBranch;
    private String ifscCode;
    private String swiftCode;

    // Tax & Legal (10 fields)
    private String taxIdentificationNumber;

    // India-Specific (3 fields)
    private String panNumber;
    private String aadharNumber;
    private String uanNumber;

    // USA-Specific (3 fields)
    private String ssnNumber;
    private String driversLicenseNumber;
    private String passportNumber;

    // Resignation/Exit (7 fields)
    private LocalDate resignationDate;
    private LocalDate lastWorkingDate;
    private String exitReason;
    private String exitNotes;

    // Additional Info (7 fields)
    private String linkedInProfile;
    private String githubProfile;

    // Audit Fields
    private LocalDateTime createdAt;
    private String createdByEmail;
    private LocalDateTime updatedAt;
    private String updatedByEmail;
    private LocalDateTime deletedAt;
    private String deletedByEmail;
}
