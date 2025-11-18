package com.hrms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "employees")
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_id")
    private Position position;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reports_to")
    private Employee reportsTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private Client client;

    @Column(name = "client_name", length = 255)
    private String clientName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "project_id_string", length = 255)
    private String projectId;

    // Employee Identification
    @Column(name = "employee_code", length = 50, unique = true, nullable = false)
    private String employeeCode;

    // Personal Details
    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "middle_name", length = 100)
    private String middleName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "gender", length = 20)
    private String gender;

    @Column(name = "nationality", length = 100)
    private String nationality;

    @Column(name = "marital_status", length = 20)
    private String maritalStatus;

    @Column(name = "blood_group", length = 10)
    private String bloodGroup;

    // Contact Information
    @Column(name = "personal_email", length = 255)
    private String personalEmail;

    @Column(name = "phone_number", length = 50)
    private String phoneNumber;

    @Column(name = "work_phone", length = 50)
    private String workPhone;

    @Column(name = "alternate_phone", length = 50)
    private String alternatePhone;

    // Current Address
    @Column(name = "current_address_line1", length = 255)
    private String currentAddressLine1;

    @Column(name = "current_address_line2", length = 255)
    private String currentAddressLine2;

    @Column(name = "current_city", length = 100)
    private String currentCity;

    @Column(name = "current_state", length = 100)
    private String currentState;

    @Column(name = "current_country", length = 100)
    private String currentCountry;

    @Column(name = "current_postal_code", length = 20)
    private String currentPostalCode;

    // Permanent Address
    @Column(name = "permanent_address_line1", length = 255)
    private String permanentAddressLine1;

    @Column(name = "permanent_address_line2", length = 255)
    private String permanentAddressLine2;

    @Column(name = "permanent_city", length = 100)
    private String permanentCity;

    @Column(name = "permanent_state", length = 100)
    private String permanentState;

    @Column(name = "permanent_country", length = 100)
    private String permanentCountry;

    @Column(name = "permanent_postal_code", length = 20)
    private String permanentPostalCode;

    @Column(name = "same_as_current_address")
    private Boolean sameAsCurrentAddress = false;

    // Emergency Contact
    @Column(name = "emergency_contact_name", length = 255)
    private String emergencyContactName;

    @Column(name = "emergency_contact_relationship", length = 100)
    private String emergencyContactRelationship;

    @Column(name = "emergency_contact_phone", length = 50)
    private String emergencyContactPhone;

    @Column(name = "emergency_contact_email", length = 255)
    private String emergencyContactEmail;

    @Column(name = "alternate_emergency_contact_name", length = 255)
    private String alternateEmergencyContactName;

    @Column(name = "alternate_emergency_contact_relationship", length = 100)
    private String alternateEmergencyContactRelationship;

    @Column(name = "alternate_emergency_contact_phone", length = 50)
    private String alternateEmergencyContactPhone;

    // Employment Details
    @Column(name = "joining_date", nullable = false)
    private LocalDate joiningDate;

    @Column(name = "confirmation_date")
    private LocalDate confirmationDate;

    @Column(name = "original_hire_date")
    private LocalDate originalHireDate;

    @Column(name = "employment_type", length = 50, nullable = false)
    private String employmentType = "internal";

    @Column(name = "employment_status", length = 50, nullable = false)
    private String employmentStatus = "active";

    @Column(name = "work_location", length = 255)
    private String workLocation;

    @Column(name = "designation", length = 255)
    private String designation;

    @Column(name = "grade", length = 50)
    private String grade;

    @Column(name = "level", length = 50)
    private String level;

    @Column(name = "notice_period_days")
    private Integer noticePeriodDays = 30;

    @Column(name = "contract_start_date")
    private LocalDate contractStartDate;

    @Column(name = "contract_end_date")
    private LocalDate contractEndDate;

    // Probation Period
    @Column(name = "is_probation")
    private Boolean isProbation = false;

    @Column(name = "probation_start_date")
    private LocalDate probationStartDate;

    @Column(name = "probation_end_date")
    private LocalDate probationEndDate;

    @Column(name = "probation_status", length = 20)
    private String probationStatus;

    // Compensation
    @Column(name = "basic_salary", precision = 12, scale = 2)
    private BigDecimal basicSalary;

    @Column(name = "salary_currency", length = 10)
    private String salaryCurrency = "USD";

    @Column(name = "pay_frequency", length = 20)
    private String payFrequency = "monthly";

    @Column(name = "payment_method", length = 50)
    private String paymentMethod = "bank_transfer";

    @Column(name = "last_salary_review_date")
    private LocalDate lastSalaryReviewDate;

    @Column(name = "next_salary_review_date")
    private LocalDate nextSalaryReviewDate;

    // Bank Details
    @Column(name = "bank_name", length = 255)
    private String bankName;

    @Column(name = "bank_account_number", length = 100)
    private String bankAccountNumber;

    @Column(name = "bank_account_holder_name", length = 255)
    private String bankAccountHolderName;

    @Column(name = "bank_ifsc_code", length = 50)
    private String bankIfscCode;

    @Column(name = "bank_swift_code", length = 50)
    private String bankSwiftCode;

    @Column(name = "bank_branch", length = 255)
    private String bankBranch;

    // Tax & Legal Documents
    @Column(name = "tax_id", length = 50)
    private String taxId;

    @Column(name = "tax_filing_status", length = 50)
    private String taxFilingStatus;

    @Column(name = "ssn_last_four", length = 4)
    private String ssnLastFour;

    @Column(name = "passport_number", length = 50)
    private String passportNumber;

    @Column(name = "passport_expiry_date")
    private LocalDate passportExpiryDate;

    @Column(name = "passport_issuing_country", length = 100)
    private String passportIssuingCountry;

    @Column(name = "visa_type", length = 50)
    private String visaType;

    @Column(name = "visa_expiry_date")
    private LocalDate visaExpiryDate;

    @Column(name = "work_permit_number", length = 50)
    private String workPermitNumber;

    @Column(name = "work_permit_expiry_date")
    private LocalDate workPermitExpiryDate;

    // Country-Specific (India)
    @Column(name = "pan_number", length = 50)
    private String panNumber;

    @Column(name = "aadhar_number_last_four", length = 4)
    private String aadharNumberLastFour;

    @Column(name = "uan_number", length = 50)
    private String uanNumber;

    // Country-Specific (USA)
    @Column(name = "drivers_license_number", length = 50)
    private String driversLicenseNumber;

    @Column(name = "drivers_license_state", length = 50)
    private String driversLicenseState;

    @Column(name = "drivers_license_expiry")
    private LocalDate driversLicenseExpiry;

    // Termination/Resignation
    @Column(name = "resignation_date")
    private LocalDate resignationDate;

    @Column(name = "resignation_accepted_date")
    private LocalDate resignationAcceptedDate;

    @Column(name = "last_working_date")
    private LocalDate lastWorkingDate;

    @Column(name = "exit_interview_completed")
    private Boolean exitInterviewCompleted = false;

    @Column(name = "exit_reason", length = 50)
    private String exitReason;

    @Column(name = "exit_notes", length = 2000)
    private String exitNotes;

    @Column(name = "rehire_eligible")
    private Boolean rehireEligible = true;

    @Column(name = "notice_period_served")
    private Boolean noticePeriodServed;

    // Additional Information
    @Column(name = "profile_photo_url", length = 500)
    private String profilePhotoUrl;

    @Column(name = "linkedin_profile", length = 255)
    private String linkedinProfile;

    @Column(name = "github_profile", length = 255)
    private String githubProfile;

    @Column(name = "skills", length = 1000)
    private String skills;

    @Column(name = "certifications", length = 1000)
    private String certifications;

    @Column(name = "languages_known", length = 500)
    private String languagesKnown;

    @Column(name = "hobbies", length = 500)
    private String hobbies;

    @Column(name = "notes", length = 2000)
    private String notes;

    // Permission Groups
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "employee_permission_groups",
        joinColumns = @JoinColumn(name = "employee_id"),
        inverseJoinColumns = @JoinColumn(name = "group_id")
    )
    private Set<PermissionGroup> permissionGroups = new HashSet<>();

    // Audit Fields
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deleted_by")
    private User deletedBy;

    public Employee() {
        this.createdAt = LocalDateTime.now();
    }

    public Employee(User user, Organization organization) {
        this();
        this.user = user;
        this.organization = organization;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }

    public Position getPosition() { return position; }
    public void setPosition(Position position) { this.position = position; }

    public Employee getReportsTo() { return reportsTo; }
    public void setReportsTo(Employee reportsTo) { this.reportsTo = reportsTo; }

    public Vendor getVendor() { return vendor; }
    public void setVendor(Vendor vendor) { this.vendor = vendor; }

    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getMiddleName() { return middleName; }
    public void setMiddleName(String middleName) { this.middleName = middleName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

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

    public Boolean getSameAsCurrentAddress() { return sameAsCurrentAddress; }
    public void setSameAsCurrentAddress(Boolean sameAsCurrentAddress) { this.sameAsCurrentAddress = sameAsCurrentAddress; }

    public String getEmergencyContactName() { return emergencyContactName; }
    public void setEmergencyContactName(String emergencyContactName) { this.emergencyContactName = emergencyContactName; }

    public String getEmergencyContactRelationship() { return emergencyContactRelationship; }
    public void setEmergencyContactRelationship(String emergencyContactRelationship) { this.emergencyContactRelationship = emergencyContactRelationship; }

    public String getEmergencyContactPhone() { return emergencyContactPhone; }
    public void setEmergencyContactPhone(String emergencyContactPhone) { this.emergencyContactPhone = emergencyContactPhone; }

    public String getEmergencyContactEmail() { return emergencyContactEmail; }
    public void setEmergencyContactEmail(String emergencyContactEmail) { this.emergencyContactEmail = emergencyContactEmail; }

    public String getAlternateEmergencyContactName() { return alternateEmergencyContactName; }
    public void setAlternateEmergencyContactName(String alternateEmergencyContactName) { this.alternateEmergencyContactName = alternateEmergencyContactName; }

    public String getAlternateEmergencyContactRelationship() { return alternateEmergencyContactRelationship; }
    public void setAlternateEmergencyContactRelationship(String alternateEmergencyContactRelationship) { this.alternateEmergencyContactRelationship = alternateEmergencyContactRelationship; }

    public String getAlternateEmergencyContactPhone() { return alternateEmergencyContactPhone; }
    public void setAlternateEmergencyContactPhone(String alternateEmergencyContactPhone) { this.alternateEmergencyContactPhone = alternateEmergencyContactPhone; }

    public LocalDate getJoiningDate() { return joiningDate; }
    public void setJoiningDate(LocalDate joiningDate) { this.joiningDate = joiningDate; }

    public LocalDate getConfirmationDate() { return confirmationDate; }
    public void setConfirmationDate(LocalDate confirmationDate) { this.confirmationDate = confirmationDate; }

    public LocalDate getOriginalHireDate() { return originalHireDate; }
    public void setOriginalHireDate(LocalDate originalHireDate) { this.originalHireDate = originalHireDate; }

    public String getEmploymentType() { return employmentType; }
    public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }

    public String getEmploymentStatus() { return employmentStatus; }
    public void setEmploymentStatus(String employmentStatus) { this.employmentStatus = employmentStatus; }

    public String getWorkLocation() { return workLocation; }
    public void setWorkLocation(String workLocation) { this.workLocation = workLocation; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public Integer getNoticePeriodDays() { return noticePeriodDays; }
    public void setNoticePeriodDays(Integer noticePeriodDays) { this.noticePeriodDays = noticePeriodDays; }

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

    public String getSalaryCurrency() { return salaryCurrency; }
    public void setSalaryCurrency(String salaryCurrency) { this.salaryCurrency = salaryCurrency; }

    public String getPayFrequency() { return payFrequency; }
    public void setPayFrequency(String payFrequency) { this.payFrequency = payFrequency; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public LocalDate getLastSalaryReviewDate() { return lastSalaryReviewDate; }
    public void setLastSalaryReviewDate(LocalDate lastSalaryReviewDate) { this.lastSalaryReviewDate = lastSalaryReviewDate; }

    public LocalDate getNextSalaryReviewDate() { return nextSalaryReviewDate; }
    public void setNextSalaryReviewDate(LocalDate nextSalaryReviewDate) { this.nextSalaryReviewDate = nextSalaryReviewDate; }

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }

    public String getBankAccountNumber() { return bankAccountNumber; }
    public void setBankAccountNumber(String bankAccountNumber) { this.bankAccountNumber = bankAccountNumber; }

    public String getBankAccountHolderName() { return bankAccountHolderName; }
    public void setBankAccountHolderName(String bankAccountHolderName) { this.bankAccountHolderName = bankAccountHolderName; }

    public String getBankIfscCode() { return bankIfscCode; }
    public void setBankIfscCode(String bankIfscCode) { this.bankIfscCode = bankIfscCode; }

    public String getBankSwiftCode() { return bankSwiftCode; }
    public void setBankSwiftCode(String bankSwiftCode) { this.bankSwiftCode = bankSwiftCode; }

    public String getBankBranch() { return bankBranch; }
    public void setBankBranch(String bankBranch) { this.bankBranch = bankBranch; }

    public String getTaxId() { return taxId; }
    public void setTaxId(String taxId) { this.taxId = taxId; }

    public String getTaxFilingStatus() { return taxFilingStatus; }
    public void setTaxFilingStatus(String taxFilingStatus) { this.taxFilingStatus = taxFilingStatus; }

    public String getSsnLastFour() { return ssnLastFour; }
    public void setSsnLastFour(String ssnLastFour) { this.ssnLastFour = ssnLastFour; }

    public String getPassportNumber() { return passportNumber; }
    public void setPassportNumber(String passportNumber) { this.passportNumber = passportNumber; }

    public LocalDate getPassportExpiryDate() { return passportExpiryDate; }
    public void setPassportExpiryDate(LocalDate passportExpiryDate) { this.passportExpiryDate = passportExpiryDate; }

    public String getPassportIssuingCountry() { return passportIssuingCountry; }
    public void setPassportIssuingCountry(String passportIssuingCountry) { this.passportIssuingCountry = passportIssuingCountry; }

    public String getVisaType() { return visaType; }
    public void setVisaType(String visaType) { this.visaType = visaType; }

    public LocalDate getVisaExpiryDate() { return visaExpiryDate; }
    public void setVisaExpiryDate(LocalDate visaExpiryDate) { this.visaExpiryDate = visaExpiryDate; }

    public String getWorkPermitNumber() { return workPermitNumber; }
    public void setWorkPermitNumber(String workPermitNumber) { this.workPermitNumber = workPermitNumber; }

    public LocalDate getWorkPermitExpiryDate() { return workPermitExpiryDate; }
    public void setWorkPermitExpiryDate(LocalDate workPermitExpiryDate) { this.workPermitExpiryDate = workPermitExpiryDate; }

    public String getPanNumber() { return panNumber; }
    public void setPanNumber(String panNumber) { this.panNumber = panNumber; }

    public String getAadharNumberLastFour() { return aadharNumberLastFour; }
    public void setAadharNumberLastFour(String aadharNumberLastFour) { this.aadharNumberLastFour = aadharNumberLastFour; }

    public String getUanNumber() { return uanNumber; }
    public void setUanNumber(String uanNumber) { this.uanNumber = uanNumber; }

    public String getDriversLicenseNumber() { return driversLicenseNumber; }
    public void setDriversLicenseNumber(String driversLicenseNumber) { this.driversLicenseNumber = driversLicenseNumber; }

    public String getDriversLicenseState() { return driversLicenseState; }
    public void setDriversLicenseState(String driversLicenseState) { this.driversLicenseState = driversLicenseState; }

    public LocalDate getDriversLicenseExpiry() { return driversLicenseExpiry; }
    public void setDriversLicenseExpiry(LocalDate driversLicenseExpiry) { this.driversLicenseExpiry = driversLicenseExpiry; }

    public LocalDate getResignationDate() { return resignationDate; }
    public void setResignationDate(LocalDate resignationDate) { this.resignationDate = resignationDate; }

    public LocalDate getResignationAcceptedDate() { return resignationAcceptedDate; }
    public void setResignationAcceptedDate(LocalDate resignationAcceptedDate) { this.resignationAcceptedDate = resignationAcceptedDate; }

    public LocalDate getLastWorkingDate() { return lastWorkingDate; }
    public void setLastWorkingDate(LocalDate lastWorkingDate) { this.lastWorkingDate = lastWorkingDate; }

    public Boolean getExitInterviewCompleted() { return exitInterviewCompleted; }
    public void setExitInterviewCompleted(Boolean exitInterviewCompleted) { this.exitInterviewCompleted = exitInterviewCompleted; }

    public String getExitReason() { return exitReason; }
    public void setExitReason(String exitReason) { this.exitReason = exitReason; }

    public String getExitNotes() { return exitNotes; }
    public void setExitNotes(String exitNotes) { this.exitNotes = exitNotes; }

    public Boolean getRehireEligible() { return rehireEligible; }
    public void setRehireEligible(Boolean rehireEligible) { this.rehireEligible = rehireEligible; }

    public Boolean getNoticePeriodServed() { return noticePeriodServed; }
    public void setNoticePeriodServed(Boolean noticePeriodServed) { this.noticePeriodServed = noticePeriodServed; }

    public String getProfilePhotoUrl() { return profilePhotoUrl; }
    public void setProfilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; }

    public String getLinkedinProfile() { return linkedinProfile; }
    public void setLinkedinProfile(String linkedinProfile) { this.linkedinProfile = linkedinProfile; }

    public String getGithubProfile() { return githubProfile; }
    public void setGithubProfile(String githubProfile) { this.githubProfile = githubProfile; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public String getCertifications() { return certifications; }
    public void setCertifications(String certifications) { this.certifications = certifications; }

    public String getLanguagesKnown() { return languagesKnown; }
    public void setLanguagesKnown(String languagesKnown) { this.languagesKnown = languagesKnown; }

    public String getHobbies() { return hobbies; }
    public void setHobbies(String hobbies) { this.hobbies = hobbies; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Set<PermissionGroup> getPermissionGroups() { return permissionGroups; }
    public void setPermissionGroups(Set<PermissionGroup> permissionGroups) { this.permissionGroups = permissionGroups; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public User getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(User updatedBy) { this.updatedBy = updatedBy; }

    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }

    public User getDeletedBy() { return deletedBy; }
    public void setDeletedBy(User deletedBy) { this.deletedBy = deletedBy; }

    public boolean isDeleted() {
        return deletedAt != null;
    }

    // Convenience methods (aliases for compatibility)
    public String getCurrency() { return salaryCurrency; }
    public void setCurrency(String currency) { this.salaryCurrency = currency; }

    public String getIfscCode() { return bankIfscCode; }
    public void setIfscCode(String ifscCode) { this.bankIfscCode = ifscCode; }

    public String getSwiftCode() { return bankSwiftCode; }
    public void setSwiftCode(String swiftCode) { this.bankSwiftCode = swiftCode; }

    public String getTaxIdentificationNumber() { return taxId; }
    public void setTaxIdentificationNumber(String taxIdentificationNumber) { this.taxId = taxIdentificationNumber; }

    public String getAadharNumber() { return aadharNumberLastFour; }
    public void setAadharNumber(String aadharNumber) { this.aadharNumberLastFour = aadharNumber; }

    public String getSsnNumber() { return ssnLastFour; }
    public void setSsnNumber(String ssnNumber) { this.ssnLastFour = ssnNumber; }

    public String getLinkedInProfile() { return linkedinProfile; }
    public void setLinkedInProfile(String linkedInProfile) { this.linkedinProfile = linkedInProfile; }

    public String getFullName() {
        StringBuilder fullName = new StringBuilder();
        if (firstName != null && !firstName.isEmpty()) {
            fullName.append(firstName);
        }
        if (middleName != null && !middleName.isEmpty()) {
            if (fullName.length() > 0) fullName.append(" ");
            fullName.append(middleName);
        }
        if (lastName != null && !lastName.isEmpty()) {
            if (fullName.length() > 0) fullName.append(" ");
            fullName.append(lastName);
        }
        return fullName.toString();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Employee)) return false;
        Employee employee = (Employee) o;
        return id != null && id.equals(employee.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
