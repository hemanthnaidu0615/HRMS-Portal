package com.hrms.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class CreateEmployeeRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Temporary password is required")
    private String temporaryPassword;

    // Personal details
    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String middleName;
    private LocalDate dateOfBirth;
    private String gender;
    private String nationality;
    private String maritalStatus;
    private String bloodGroup;

    // Contact Information
    private String personalEmail;
    private String phoneNumber;
    private String workPhone;
    private String alternatePhone;

    // Current Address
    private String currentAddressLine1;
    private String currentAddressLine2;
    private String currentCity;
    private String currentState;
    private String currentCountry;
    private String currentPostalCode;

    // Permanent Address
    private Boolean sameAsCurrentAddress;
    private String permanentAddressLine1;
    private String permanentAddressLine2;
    private String permanentCity;
    private String permanentState;
    private String permanentCountry;
    private String permanentPostalCode;

    // Emergency Contact
    private String emergencyContactName;
    private String emergencyContactRelationship;
    private String emergencyContactPhone;
    private String alternateEmergencyContactName;
    private String alternateEmergencyContactRelationship;
    private String alternateEmergencyContactPhone;

    // Organization assignment
    private UUID departmentId;
    private UUID positionId;
    private UUID reportsToId;
    private String employeeCode; // Optional, can be auto-generated

    // Employment details
    private LocalDate joiningDate;
    private String employmentType = "internal";  // internal, contract, client
    private String employmentStatus = "active";
    
    // Vendor/Client/Project Assignment
    private UUID vendorId;
    private UUID clientId;
    private UUID projectId;
    
    // Legacy fields kept for compatibility but mapped to IDs above if possible
    private String clientName; 
    private String projectIdString;

    // Contract
    private LocalDate contractStartDate;
    private LocalDate contractEndDate;

    // Probation period
    private Boolean isProbation = false;
    private LocalDate probationStartDate;
    private LocalDate probationEndDate;
    private String probationStatus;

    // Compensation
    private BigDecimal basicSalary;
    private String currency;
    private String payFrequency;

    // Bank Details
    private String accountHolderName;
    private String bankAccountNumber;
    private String bankName;
    private String bankBranch;
    private String ifscCode;
    private String swiftCode;

    // Tax & Legal
    private String taxIdentificationNumber;
    private String panNumber;
    private String aadharNumber;
    private String uanNumber;
    private String ssnNumber;
    private String driversLicenseNumber;
    private String passportNumber;

    // Social
    private String linkedInProfile;
    private String githubProfile;

    // Permission groups
    private List<UUID> permissionGroupIds;

    public CreateEmployeeRequest() {
    }

    public CreateEmployeeRequest(String email, String temporaryPassword) {
        this.email = email;
        this.temporaryPassword = temporaryPassword;
    }

    // Getters and setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTemporaryPassword() { return temporaryPassword; }
    public void setTemporaryPassword(String temporaryPassword) { this.temporaryPassword = temporaryPassword; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getMiddleName() { return middleName; }
    public void setMiddleName(String middleName) { this.middleName = middleName; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }

    public String getMaritalStatus() { return maritalStatus; }
    public void setMaritalStatus(String maritalStatus) { this.maritalStatus = maritalStatus; }

    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }

    public String getPersonalEmail() { return personalEmail; }
    public void setPersonalEmail(String personalEmail) { this.personalEmail = personalEmail; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getWorkPhone() { return workPhone; }
    public void setWorkPhone(String workPhone) { this.workPhone = workPhone; }

    public String getAlternatePhone() { return alternatePhone; }
    public void setAlternatePhone(String alternatePhone) { this.alternatePhone = alternatePhone; }

    public String getCurrentAddressLine1() { return currentAddressLine1; }
    public void setCurrentAddressLine1(String currentAddressLine1) { this.currentAddressLine1 = currentAddressLine1; }

    public String getCurrentAddressLine2() { return currentAddressLine2; }
    public void setCurrentAddressLine2(String currentAddressLine2) { this.currentAddressLine2 = currentAddressLine2; }

    public String getCurrentCity() { return currentCity; }
    public void setCurrentCity(String currentCity) { this.currentCity = currentCity; }

    public String getCurrentState() { return currentState; }
    public void setCurrentState(String currentState) { this.currentState = currentState; }

    public String getCurrentCountry() { return currentCountry; }
    public void setCurrentCountry(String currentCountry) { this.currentCountry = currentCountry; }

    public String getCurrentPostalCode() { return currentPostalCode; }
    public void setCurrentPostalCode(String currentPostalCode) { this.currentPostalCode = currentPostalCode; }

    public Boolean getSameAsCurrentAddress() { return sameAsCurrentAddress; }
    public void setSameAsCurrentAddress(Boolean sameAsCurrentAddress) { this.sameAsCurrentAddress = sameAsCurrentAddress; }

    public String getPermanentAddressLine1() { return permanentAddressLine1; }
    public void setPermanentAddressLine1(String permanentAddressLine1) { this.permanentAddressLine1 = permanentAddressLine1; }

    public String getPermanentAddressLine2() { return permanentAddressLine2; }
    public void setPermanentAddressLine2(String permanentAddressLine2) { this.permanentAddressLine2 = permanentAddressLine2; }

    public String getPermanentCity() { return permanentCity; }
    public void setPermanentCity(String permanentCity) { this.permanentCity = permanentCity; }

    public String getPermanentState() { return permanentState; }
    public void setPermanentState(String permanentState) { this.permanentState = permanentState; }

    public String getPermanentCountry() { return permanentCountry; }
    public void setPermanentCountry(String permanentCountry) { this.permanentCountry = permanentCountry; }

    public String getPermanentPostalCode() { return permanentPostalCode; }
    public void setPermanentPostalCode(String permanentPostalCode) { this.permanentPostalCode = permanentPostalCode; }

    public String getEmergencyContactName() { return emergencyContactName; }
    public void setEmergencyContactName(String emergencyContactName) { this.emergencyContactName = emergencyContactName; }

    public String getEmergencyContactRelationship() { return emergencyContactRelationship; }
    public void setEmergencyContactRelationship(String emergencyContactRelationship) { this.emergencyContactRelationship = emergencyContactRelationship; }

    public String getEmergencyContactPhone() { return emergencyContactPhone; }
    public void setEmergencyContactPhone(String emergencyContactPhone) { this.emergencyContactPhone = emergencyContactPhone; }

    public String getAlternateEmergencyContactName() { return alternateEmergencyContactName; }
    public void setAlternateEmergencyContactName(String alternateEmergencyContactName) { this.alternateEmergencyContactName = alternateEmergencyContactName; }

    public String getAlternateEmergencyContactRelationship() { return alternateEmergencyContactRelationship; }
    public void setAlternateEmergencyContactRelationship(String alternateEmergencyContactRelationship) { this.alternateEmergencyContactRelationship = alternateEmergencyContactRelationship; }

    public String getAlternateEmergencyContactPhone() { return alternateEmergencyContactPhone; }
    public void setAlternateEmergencyContactPhone(String alternateEmergencyContactPhone) { this.alternateEmergencyContactPhone = alternateEmergencyContactPhone; }

    public UUID getDepartmentId() { return departmentId; }
    public void setDepartmentId(UUID departmentId) { this.departmentId = departmentId; }

    public UUID getPositionId() { return positionId; }
    public void setPositionId(UUID positionId) { this.positionId = positionId; }

    public UUID getReportsToId() { return reportsToId; }
    public void setReportsToId(UUID reportsToId) { this.reportsToId = reportsToId; }

    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }

    public LocalDate getJoiningDate() { return joiningDate; }
    public void setJoiningDate(LocalDate joiningDate) { this.joiningDate = joiningDate; }

    public String getEmploymentType() { return employmentType; }
    public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }

    public String getEmploymentStatus() { return employmentStatus; }
    public void setEmploymentStatus(String employmentStatus) { this.employmentStatus = employmentStatus; }

    public UUID getVendorId() { return vendorId; }
    public void setVendorId(UUID vendorId) { this.vendorId = vendorId; }

    public UUID getClientId() { return clientId; }
    public void setClientId(UUID clientId) { this.clientId = clientId; }

    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public String getProjectIdString() { return projectIdString; }
    public void setProjectIdString(String projectIdString) { this.projectIdString = projectIdString; }

    public LocalDate getContractStartDate() { return contractStartDate; }
    public void setContractStartDate(LocalDate contractStartDate) { this.contractStartDate = contractStartDate; }

    public LocalDate getContractEndDate() { return contractEndDate; }
    public void setContractEndDate(LocalDate contractEndDate) { this.contractEndDate = contractEndDate; }

    public Boolean getIsProbation() { return isProbation; }
    public void setIsProbation(Boolean isProbation) { this.isProbation = isProbation; }

    public LocalDate getProbationStartDate() { return probationStartDate; }
    public void setProbationStartDate(LocalDate probationStartDate) { this.probationStartDate = probationStartDate; }

    public LocalDate getProbationEndDate() { return probationEndDate; }
    public void setProbationEndDate(LocalDate probationEndDate) { this.probationEndDate = probationEndDate; }

    public String getProbationStatus() { return probationStatus; }
    public void setProbationStatus(String probationStatus) { this.probationStatus = probationStatus; }

    public BigDecimal getBasicSalary() { return basicSalary; }
    public void setBasicSalary(BigDecimal basicSalary) { this.basicSalary = basicSalary; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getPayFrequency() { return payFrequency; }
    public void setPayFrequency(String payFrequency) { this.payFrequency = payFrequency; }

    public String getAccountHolderName() { return accountHolderName; }
    public void setAccountHolderName(String accountHolderName) { this.accountHolderName = accountHolderName; }

    public String getBankAccountNumber() { return bankAccountNumber; }
    public void setBankAccountNumber(String bankAccountNumber) { this.bankAccountNumber = bankAccountNumber; }

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }

    public String getBankBranch() { return bankBranch; }
    public void setBankBranch(String bankBranch) { this.bankBranch = bankBranch; }

    public String getIfscCode() { return ifscCode; }
    public void setIfscCode(String ifscCode) { this.ifscCode = ifscCode; }

    public String getSwiftCode() { return swiftCode; }
    public void setSwiftCode(String swiftCode) { this.swiftCode = swiftCode; }

    public String getTaxIdentificationNumber() { return taxIdentificationNumber; }
    public void setTaxIdentificationNumber(String taxIdentificationNumber) { this.taxIdentificationNumber = taxIdentificationNumber; }

    public String getPanNumber() { return panNumber; }
    public void setPanNumber(String panNumber) { this.panNumber = panNumber; }

    public String getAadharNumber() { return aadharNumber; }
    public void setAadharNumber(String aadharNumber) { this.aadharNumber = aadharNumber; }

    public String getUanNumber() { return uanNumber; }
    public void setUanNumber(String uanNumber) { this.uanNumber = uanNumber; }

    public String getSsnNumber() { return ssnNumber; }
    public void setSsnNumber(String ssnNumber) { this.ssnNumber = ssnNumber; }

    public String getDriversLicenseNumber() { return driversLicenseNumber; }
    public void setDriversLicenseNumber(String driversLicenseNumber) { this.driversLicenseNumber = driversLicenseNumber; }

    public String getPassportNumber() { return passportNumber; }
    public void setPassportNumber(String passportNumber) { this.passportNumber = passportNumber; }

    public String getLinkedInProfile() { return linkedInProfile; }
    public void setLinkedInProfile(String linkedInProfile) { this.linkedInProfile = linkedInProfile; }

    public String getGithubProfile() { return githubProfile; }
    public void setGithubProfile(String githubProfile) { this.githubProfile = githubProfile; }

    public List<UUID> getPermissionGroupIds() { return permissionGroupIds; }
    public void setPermissionGroupIds(List<UUID> permissionGroupIds) { this.permissionGroupIds = permissionGroupIds; }
}
