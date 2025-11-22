package com.hrms.entity;

import com.hrms.entity.employee.EmployeeAddress;
import com.hrms.entity.employee.EmployeeBankAccount;
import com.hrms.entity.employee.EmployeeEmergencyContact;
import com.hrms.entity.employee.EmployeeIdentityDocument;
import com.hrms.entity.employee.EmployeeTaxInfo;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Employee entity - core entity for employee management.
 *
 * NOTE: This entity has been refactored to use proper @OneToMany relationships
 * for addresses, bank accounts, emergency contacts, and identity documents.
 * The inline fields (current_address_*, bank_*, emergency_contact_*, etc.) are
 * kept for backward compatibility but marked @Deprecated.
 *
 * New code should use the relationships:
 * - addresses (List<EmployeeAddress>)
 * - bankAccounts (List<EmployeeBankAccount>)
 * - emergencyContacts (List<EmployeeEmergencyContact>)
 * - identityDocuments (List<EmployeeIdentityDocument>)
 */
@Entity
@Table(name = "employees", indexes = {
    @Index(name = "idx_employees_org", columnList = "organization_id"),
    @Index(name = "idx_employees_dept", columnList = "department_id"),
    @Index(name = "idx_employees_code", columnList = "employee_code"),
    @Index(name = "idx_employees_status", columnList = "employment_status"),
    @Index(name = "idx_employees_reports_to", columnList = "reports_to")
})
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // ==================== Relationships ====================

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    // ==================== NEW: Proper One-to-Many Relationships ====================

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EmployeeAddress> addresses = new ArrayList<>();

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EmployeeBankAccount> bankAccounts = new ArrayList<>();

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EmployeeEmergencyContact> emergencyContacts = new ArrayList<>();

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EmployeeIdentityDocument> identityDocuments = new ArrayList<>();

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EmployeeTaxInfo> taxInfoRecords = new ArrayList<>();

    // ==================== Employee Identification ====================

    @NotBlank(message = "Employee code is required")
    @Size(max = 50, message = "Employee code must not exceed 50 characters")
    @Column(name = "employee_code", length = 50, unique = true, nullable = false)
    private String employeeCode;

    // ==================== Personal Details ====================

    @Size(max = 100, message = "First name must not exceed 100 characters")
    @Column(name = "first_name", length = 100)
    private String firstName;

    @Size(max = 100, message = "Middle name must not exceed 100 characters")
    @Column(name = "middle_name", length = 100)
    private String middleName;

    @Size(max = 100, message = "Last name must not exceed 100 characters")
    @Column(name = "last_name", length = 100)
    private String lastName;

    @Size(max = 100, message = "Preferred name must not exceed 100 characters")
    @Column(name = "preferred_name", length = 100)
    private String preferredName;

    @Size(max = 50, message = "Pronouns must not exceed 50 characters")
    @Column(name = "pronouns", length = 50)
    private String pronouns;

    @Past(message = "Date of birth must be in the past")
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Size(max = 20, message = "Gender must not exceed 20 characters")
    @Column(name = "gender", length = 20)
    private String gender;

    @Size(max = 100, message = "Nationality must not exceed 100 characters")
    @Column(name = "nationality", length = 100)
    private String nationality;

    @Size(max = 20, message = "Marital status must not exceed 20 characters")
    @Column(name = "marital_status", length = 20)
    private String maritalStatus;

    @Size(max = 10, message = "Blood group must not exceed 10 characters")
    @Column(name = "blood_group", length = 10)
    private String bloodGroup;

    // ==================== Contact Information ====================

    @Email(message = "Invalid personal email format")
    @Size(max = 255, message = "Personal email must not exceed 255 characters")
    @Column(name = "personal_email", length = 255)
    private String personalEmail;

    @Email(message = "Invalid work email format")
    @Size(max = 255, message = "Work email must not exceed 255 characters")
    @Column(name = "work_email", length = 255)
    private String workEmail;

    @Size(max = 50, message = "Phone number must not exceed 50 characters")
    @Column(name = "phone_number", length = 50)
    private String phoneNumber;

    // ==================== Employment Details ====================

    @Column(name = "joining_date")
    private LocalDate joiningDate;

    @Column(name = "confirmation_date")
    private LocalDate confirmationDate;

    @Column(name = "original_hire_date")
    private LocalDate originalHireDate;

    @Size(max = 50, message = "Employment type must not exceed 50 characters")
    @Column(name = "employment_type", length = 50)
    private String employmentType = "full_time";

    @Size(max = 50, message = "Employment status must not exceed 50 characters")
    @Column(name = "employment_status", length = 50)
    private String employmentStatus = "active";

    @Size(max = 50, message = "Work arrangement must not exceed 50 characters")
    @Column(name = "work_arrangement", length = 50)
    private String workArrangement = "onsite";

    @Size(max = 255, message = "Work location must not exceed 255 characters")
    @Column(name = "work_location", length = 255)
    private String workLocation;

    @Size(max = 100, message = "Work location country must not exceed 100 characters")
    @Column(name = "work_location_country", length = 100)
    private String workLocationCountry;

    @Size(max = 100, message = "Timezone must not exceed 100 characters")
    @Column(name = "time_zone", length = 100)
    private String timeZone;

    // ==================== Onboarding Status (FIXED) ====================

    /**
     * Onboarding status - matches schema VARCHAR(50)
     * Valid values: 'not_started', 'in_progress', 'completed'
     */
    @Size(max = 50, message = "Onboarding status must not exceed 50 characters")
    @Column(name = "onboarding_status", length = 50)
    private String onboardingStatus = "not_started";

    @Column(name = "onboarding_completed_at")
    private LocalDateTime onboardingCompletedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "onboarding_completed_by")
    private User onboardingCompletedBy;

    /**
     * @deprecated Use onboardingStatus instead. This field is kept for backward compatibility.
     */
    @Deprecated
    @Column(name = "onboarding_complete")
    private Boolean onboardingComplete = false;

    // ==================== Position & Grade ====================

    @Size(max = 255, message = "Designation must not exceed 255 characters")
    @Column(name = "designation", length = 255)
    private String designation;

    @Size(max = 50, message = "Grade must not exceed 50 characters")
    @Column(name = "grade", length = 50)
    private String grade;

    @Size(max = 50, message = "Level must not exceed 50 characters")
    @Column(name = "level", length = 50)
    private String level;

    @Min(value = 0, message = "Notice period days must be non-negative")
    @Max(value = 365, message = "Notice period days must not exceed 365")
    @Column(name = "notice_period_days")
    private Integer noticePeriodDays = 30;

    // ==================== Contract Details ====================

    @Column(name = "contract_start_date")
    private LocalDate contractStartDate;

    @Column(name = "contract_end_date")
    private LocalDate contractEndDate;

    // ==================== Probation ====================

    @Column(name = "is_on_probation")
    private Boolean isOnProbation = false;

    @Column(name = "probation_start_date")
    private LocalDate probationStartDate;

    @Column(name = "probation_end_date")
    private LocalDate probationEndDate;

    @Size(max = 20, message = "Probation status must not exceed 20 characters")
    @Column(name = "probation_status", length = 20)
    private String probationStatus;

    /**
     * @deprecated Use isOnProbation instead. Kept for backward compatibility.
     */
    @Deprecated
    @Column(name = "is_probation")
    private Boolean isProbation = false;

    // ==================== Compensation ====================

    @DecimalMin(value = "0.0", message = "Basic salary must be non-negative")
    @Column(name = "basic_salary", precision = 12, scale = 2)
    private BigDecimal basicSalary;

    @Size(max = 10, message = "Salary currency must not exceed 10 characters")
    @Column(name = "salary_currency", length = 10)
    private String salaryCurrency = "USD";

    @Size(max = 20, message = "Pay frequency must not exceed 20 characters")
    @Column(name = "pay_frequency", length = 20)
    private String payFrequency = "monthly";

    @Size(max = 50, message = "Payment method must not exceed 50 characters")
    @Column(name = "payment_method", length = 50)
    private String paymentMethod = "bank_transfer";

    @Column(name = "last_salary_review_date")
    private LocalDate lastSalaryReviewDate;

    @Column(name = "next_salary_review_date")
    private LocalDate nextSalaryReviewDate;

    // ==================== Exit Information ====================

    @Column(name = "resignation_date")
    private LocalDate resignationDate;

    @Column(name = "resignation_accepted_date")
    private LocalDate resignationAcceptedDate;

    @Column(name = "last_working_date")
    private LocalDate lastWorkingDate;

    @Size(max = 50, message = "Exit type must not exceed 50 characters")
    @Column(name = "exit_type", length = 50)
    private String exitType;

    @Size(max = 100, message = "Exit reason must not exceed 100 characters")
    @Column(name = "exit_reason", length = 100)
    private String exitReason;

    @Column(name = "exit_notes", columnDefinition = "NVARCHAR(MAX)")
    private String exitNotes;

    @Column(name = "exit_interview_completed")
    private Boolean exitInterviewCompleted = false;

    @Column(name = "is_rehire_eligible")
    private Boolean isRehireEligible = true;

    @Column(name = "notice_period_served")
    private Boolean noticePeriodServed;

    // ==================== Profile & Social ====================

    @Size(max = 500, message = "Profile photo URL must not exceed 500 characters")
    @Column(name = "profile_photo_url", length = 500)
    private String profilePhotoUrl;

    @Size(max = 255, message = "LinkedIn profile must not exceed 255 characters")
    @Column(name = "linkedin_profile", length = 255)
    private String linkedinProfile;

    @Size(max = 255, message = "GitHub profile must not exceed 255 characters")
    @Column(name = "github_profile", length = 255)
    private String githubProfile;

    @Size(max = 255, message = "Personal website must not exceed 255 characters")
    @Column(name = "personal_website", length = 255)
    private String personalWebsite;

    @Column(name = "skills", columnDefinition = "NVARCHAR(MAX)")
    private String skills;

    @Column(name = "certifications", columnDefinition = "NVARCHAR(MAX)")
    private String certifications;

    @Column(name = "languages_spoken", columnDefinition = "NVARCHAR(MAX)")
    private String languagesSpoken;

    @Size(max = 20, message = "T-shirt size must not exceed 20 characters")
    @Column(name = "tshirt_size", length = 20)
    private String tshirtSize;

    @Size(max = 255, message = "Dietary preferences must not exceed 255 characters")
    @Column(name = "dietary_preferences", length = 255)
    private String dietaryPreferences;

    @Column(name = "bio", columnDefinition = "NVARCHAR(MAX)")
    private String bio;

    // ==================== Permission Groups ====================

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "employee_permission_groups",
        joinColumns = @JoinColumn(name = "employee_id"),
        inverseJoinColumns = @JoinColumn(name = "group_id")
    )
    private Set<PermissionGroup> permissionGroups = new HashSet<>();

    // ==================== Audit Fields ====================

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @UpdateTimestamp
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

    // ==================== DEPRECATED FIELDS ====================
    // These fields are kept for backward compatibility.
    // New code should use the relationship collections instead.

    @Deprecated
    @Column(name = "client_name", length = 255)
    private String clientName;

    @Deprecated
    @Column(name = "project_id_string", length = 255)
    private String projectIdString;

    @Deprecated
    @Column(name = "personal_phone", length = 50)
    private String personalPhone;

    @Deprecated
    @Column(name = "work_phone", length = 50)
    private String workPhone;

    @Deprecated
    @Column(name = "alternate_phone", length = 50)
    private String alternatePhone;

    // Deprecated address fields - use addresses relationship instead
    @Deprecated
    @Column(name = "current_address_line1", length = 255)
    private String currentAddressLine1;

    @Deprecated
    @Column(name = "current_address_line2", length = 255)
    private String currentAddressLine2;

    @Deprecated
    @Column(name = "current_city", length = 100)
    private String currentCity;

    @Deprecated
    @Column(name = "current_state", length = 100)
    private String currentState;

    @Deprecated
    @Column(name = "current_country", length = 100)
    private String currentCountry;

    @Deprecated
    @Column(name = "current_postal_code", length = 20)
    private String currentPostalCode;

    @Deprecated
    @Column(name = "permanent_address_line1", length = 255)
    private String permanentAddressLine1;

    @Deprecated
    @Column(name = "permanent_address_line2", length = 255)
    private String permanentAddressLine2;

    @Deprecated
    @Column(name = "permanent_city", length = 100)
    private String permanentCity;

    @Deprecated
    @Column(name = "permanent_state", length = 100)
    private String permanentState;

    @Deprecated
    @Column(name = "permanent_country", length = 100)
    private String permanentCountry;

    @Deprecated
    @Column(name = "permanent_postal_code", length = 20)
    private String permanentPostalCode;

    @Deprecated
    @Column(name = "same_as_current_address")
    private Boolean sameAsCurrentAddress = false;

    // Deprecated emergency contact fields - use emergencyContacts relationship
    @Deprecated
    @Column(name = "emergency_contact_name", length = 255)
    private String emergencyContactName;

    @Deprecated
    @Column(name = "emergency_contact_relationship", length = 100)
    private String emergencyContactRelationship;

    @Deprecated
    @Column(name = "emergency_contact_phone", length = 50)
    private String emergencyContactPhone;

    @Deprecated
    @Column(name = "emergency_contact_email", length = 255)
    private String emergencyContactEmail;

    @Deprecated
    @Column(name = "alternate_emergency_contact_name", length = 255)
    private String alternateEmergencyContactName;

    @Deprecated
    @Column(name = "alternate_emergency_contact_relationship", length = 100)
    private String alternateEmergencyContactRelationship;

    @Deprecated
    @Column(name = "alternate_emergency_contact_phone", length = 50)
    private String alternateEmergencyContactPhone;

    // Deprecated bank fields - use bankAccounts relationship
    @Deprecated
    @Column(name = "bank_name", length = 255)
    private String bankName;

    @Deprecated
    @Column(name = "bank_account_number", length = 100)
    private String bankAccountNumber;

    @Deprecated
    @Column(name = "bank_account_holder_name", length = 255)
    private String bankAccountHolderName;

    @Deprecated
    @Column(name = "bank_ifsc_code", length = 50)
    private String bankIfscCode;

    @Deprecated
    @Column(name = "bank_swift_code", length = 50)
    private String bankSwiftCode;

    @Deprecated
    @Column(name = "bank_branch", length = 255)
    private String bankBranch;

    // Deprecated tax/document fields - use identityDocuments relationship
    @Deprecated
    @Column(name = "tax_id", length = 50)
    private String taxId;

    @Deprecated
    @Column(name = "tax_filing_status", length = 50)
    private String taxFilingStatus;

    @Deprecated
    @Column(name = "ssn_last_four", length = 4)
    private String ssnLastFour;

    @Deprecated
    @Column(name = "passport_number", length = 50)
    private String passportNumber;

    @Deprecated
    @Column(name = "passport_expiry_date")
    private LocalDate passportExpiryDate;

    @Deprecated
    @Column(name = "passport_issuing_country", length = 100)
    private String passportIssuingCountry;

    @Deprecated
    @Column(name = "visa_type", length = 50)
    private String visaType;

    @Deprecated
    @Column(name = "visa_expiry_date")
    private LocalDate visaExpiryDate;

    @Deprecated
    @Column(name = "work_permit_number", length = 50)
    private String workPermitNumber;

    @Deprecated
    @Column(name = "work_permit_expiry_date")
    private LocalDate workPermitExpiryDate;

    @Deprecated
    @Column(name = "pan_number", length = 50)
    private String panNumber;

    @Deprecated
    @Column(name = "aadhar_number_last_four", length = 4)
    private String aadharNumberLastFour;

    @Deprecated
    @Column(name = "uan_number", length = 50)
    private String uanNumber;

    @Deprecated
    @Column(name = "drivers_license_number", length = 50)
    private String driversLicenseNumber;

    @Deprecated
    @Column(name = "drivers_license_state", length = 50)
    private String driversLicenseState;

    @Deprecated
    @Column(name = "drivers_license_expiry")
    private LocalDate driversLicenseExpiry;

    // Legacy fields for compatibility
    @Deprecated
    @Column(name = "languages_known", length = 500)
    private String languagesKnown;

    @Deprecated
    @Column(name = "hobbies", length = 500)
    private String hobbies;

    @Deprecated
    @Column(name = "notes", length = 2000)
    private String notes;

    @Deprecated
    @Column(name = "rehire_eligible")
    private Boolean rehireEligible;

    // ==================== Constructors ====================

    public Employee() {
    }

    public Employee(User user, Organization organization) {
        this.user = user;
        this.organization = organization;
    }

    // ==================== Core Getters and Setters ====================

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

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    // Relationship collections
    public List<EmployeeAddress> getAddresses() { return addresses; }
    public void setAddresses(List<EmployeeAddress> addresses) { this.addresses = addresses; }

    public List<EmployeeBankAccount> getBankAccounts() { return bankAccounts; }
    public void setBankAccounts(List<EmployeeBankAccount> bankAccounts) { this.bankAccounts = bankAccounts; }

    public List<EmployeeEmergencyContact> getEmergencyContacts() { return emergencyContacts; }
    public void setEmergencyContacts(List<EmployeeEmergencyContact> emergencyContacts) { this.emergencyContacts = emergencyContacts; }

    public List<EmployeeIdentityDocument> getIdentityDocuments() { return identityDocuments; }
    public void setIdentityDocuments(List<EmployeeIdentityDocument> identityDocuments) { this.identityDocuments = identityDocuments; }

    public List<EmployeeTaxInfo> getTaxInfoRecords() { return taxInfoRecords; }
    public void setTaxInfoRecords(List<EmployeeTaxInfo> taxInfoRecords) { this.taxInfoRecords = taxInfoRecords; }

    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getMiddleName() { return middleName; }
    public void setMiddleName(String middleName) { this.middleName = middleName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getPreferredName() { return preferredName; }
    public void setPreferredName(String preferredName) { this.preferredName = preferredName; }

    public String getPronouns() { return pronouns; }
    public void setPronouns(String pronouns) { this.pronouns = pronouns; }

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

    public String getWorkEmail() { return workEmail; }
    public void setWorkEmail(String workEmail) { this.workEmail = workEmail; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

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

    public String getWorkArrangement() { return workArrangement; }
    public void setWorkArrangement(String workArrangement) { this.workArrangement = workArrangement; }

    public String getWorkLocation() { return workLocation; }
    public void setWorkLocation(String workLocation) { this.workLocation = workLocation; }

    public String getWorkLocationCountry() { return workLocationCountry; }
    public void setWorkLocationCountry(String workLocationCountry) { this.workLocationCountry = workLocationCountry; }

    public String getTimeZone() { return timeZone; }
    public void setTimeZone(String timeZone) { this.timeZone = timeZone; }

    // Onboarding status
    public String getOnboardingStatus() { return onboardingStatus; }
    public void setOnboardingStatus(String onboardingStatus) {
        this.onboardingStatus = onboardingStatus;
        // Sync with deprecated field
        this.onboardingComplete = "completed".equals(onboardingStatus);
    }

    public LocalDateTime getOnboardingCompletedAt() { return onboardingCompletedAt; }
    public void setOnboardingCompletedAt(LocalDateTime onboardingCompletedAt) { this.onboardingCompletedAt = onboardingCompletedAt; }

    public User getOnboardingCompletedBy() { return onboardingCompletedBy; }
    public void setOnboardingCompletedBy(User onboardingCompletedBy) { this.onboardingCompletedBy = onboardingCompletedBy; }

    @Deprecated
    public Boolean getOnboardingComplete() { return onboardingComplete; }

    @Deprecated
    public void setOnboardingComplete(Boolean onboardingComplete) {
        this.onboardingComplete = onboardingComplete;
        // Sync with new field
        this.onboardingStatus = Boolean.TRUE.equals(onboardingComplete) ? "completed" : "in_progress";
    }

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

    public Boolean getIsOnProbation() { return isOnProbation; }
    public void setIsOnProbation(Boolean isOnProbation) {
        this.isOnProbation = isOnProbation;
        this.isProbation = isOnProbation; // Sync deprecated field
    }

    @Deprecated
    public Boolean getIsProbation() { return isProbation; }

    @Deprecated
    public void setIsProbation(Boolean isProbation) {
        this.isProbation = isProbation;
        this.isOnProbation = isProbation; // Sync new field
    }

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

    public LocalDate getResignationDate() { return resignationDate; }
    public void setResignationDate(LocalDate resignationDate) { this.resignationDate = resignationDate; }

    public LocalDate getResignationAcceptedDate() { return resignationAcceptedDate; }
    public void setResignationAcceptedDate(LocalDate resignationAcceptedDate) { this.resignationAcceptedDate = resignationAcceptedDate; }

    public LocalDate getLastWorkingDate() { return lastWorkingDate; }
    public void setLastWorkingDate(LocalDate lastWorkingDate) { this.lastWorkingDate = lastWorkingDate; }

    public String getExitType() { return exitType; }
    public void setExitType(String exitType) { this.exitType = exitType; }

    public String getExitReason() { return exitReason; }
    public void setExitReason(String exitReason) { this.exitReason = exitReason; }

    public String getExitNotes() { return exitNotes; }
    public void setExitNotes(String exitNotes) { this.exitNotes = exitNotes; }

    public Boolean getExitInterviewCompleted() { return exitInterviewCompleted; }
    public void setExitInterviewCompleted(Boolean exitInterviewCompleted) { this.exitInterviewCompleted = exitInterviewCompleted; }

    public Boolean getIsRehireEligible() { return isRehireEligible; }
    public void setIsRehireEligible(Boolean isRehireEligible) { this.isRehireEligible = isRehireEligible; }

    public Boolean getNoticePeriodServed() { return noticePeriodServed; }
    public void setNoticePeriodServed(Boolean noticePeriodServed) { this.noticePeriodServed = noticePeriodServed; }

    public String getProfilePhotoUrl() { return profilePhotoUrl; }
    public void setProfilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; }

    public String getLinkedinProfile() { return linkedinProfile; }
    public void setLinkedinProfile(String linkedinProfile) { this.linkedinProfile = linkedinProfile; }

    public String getGithubProfile() { return githubProfile; }
    public void setGithubProfile(String githubProfile) { this.githubProfile = githubProfile; }

    public String getPersonalWebsite() { return personalWebsite; }
    public void setPersonalWebsite(String personalWebsite) { this.personalWebsite = personalWebsite; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public String getCertifications() { return certifications; }
    public void setCertifications(String certifications) { this.certifications = certifications; }

    public String getLanguagesSpoken() { return languagesSpoken; }
    public void setLanguagesSpoken(String languagesSpoken) { this.languagesSpoken = languagesSpoken; }

    public String getTshirtSize() { return tshirtSize; }
    public void setTshirtSize(String tshirtSize) { this.tshirtSize = tshirtSize; }

    public String getDietaryPreferences() { return dietaryPreferences; }
    public void setDietaryPreferences(String dietaryPreferences) { this.dietaryPreferences = dietaryPreferences; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

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

    // ==================== Deprecated Getters/Setters ====================
    // These are kept for backward compatibility

    @Deprecated public String getClientName() { return clientName; }
    @Deprecated public void setClientName(String clientName) { this.clientName = clientName; }
    @Deprecated public String getProjectId() { return projectIdString; }
    @Deprecated public void setProjectId(String projectId) { this.projectIdString = projectId; }
    @Deprecated public String getPersonalPhone() { return personalPhone; }
    @Deprecated public void setPersonalPhone(String personalPhone) { this.personalPhone = personalPhone; }
    @Deprecated public String getWorkPhone() { return workPhone; }
    @Deprecated public void setWorkPhone(String workPhone) { this.workPhone = workPhone; }
    @Deprecated public String getAlternatePhone() { return alternatePhone; }
    @Deprecated public void setAlternatePhone(String alternatePhone) { this.alternatePhone = alternatePhone; }
    @Deprecated public String getCurrentAddressLine1() { return currentAddressLine1; }
    @Deprecated public void setCurrentAddressLine1(String v) { this.currentAddressLine1 = v; }
    @Deprecated public String getCurrentAddressLine2() { return currentAddressLine2; }
    @Deprecated public void setCurrentAddressLine2(String v) { this.currentAddressLine2 = v; }
    @Deprecated public String getCurrentCity() { return currentCity; }
    @Deprecated public void setCurrentCity(String v) { this.currentCity = v; }
    @Deprecated public String getCurrentState() { return currentState; }
    @Deprecated public void setCurrentState(String v) { this.currentState = v; }
    @Deprecated public String getCurrentCountry() { return currentCountry; }
    @Deprecated public void setCurrentCountry(String v) { this.currentCountry = v; }
    @Deprecated public String getCurrentPostalCode() { return currentPostalCode; }
    @Deprecated public void setCurrentPostalCode(String v) { this.currentPostalCode = v; }
    @Deprecated public String getPermanentAddressLine1() { return permanentAddressLine1; }
    @Deprecated public void setPermanentAddressLine1(String v) { this.permanentAddressLine1 = v; }
    @Deprecated public String getPermanentAddressLine2() { return permanentAddressLine2; }
    @Deprecated public void setPermanentAddressLine2(String v) { this.permanentAddressLine2 = v; }
    @Deprecated public String getPermanentCity() { return permanentCity; }
    @Deprecated public void setPermanentCity(String v) { this.permanentCity = v; }
    @Deprecated public String getPermanentState() { return permanentState; }
    @Deprecated public void setPermanentState(String v) { this.permanentState = v; }
    @Deprecated public String getPermanentCountry() { return permanentCountry; }
    @Deprecated public void setPermanentCountry(String v) { this.permanentCountry = v; }
    @Deprecated public String getPermanentPostalCode() { return permanentPostalCode; }
    @Deprecated public void setPermanentPostalCode(String v) { this.permanentPostalCode = v; }
    @Deprecated public Boolean getSameAsCurrentAddress() { return sameAsCurrentAddress; }
    @Deprecated public void setSameAsCurrentAddress(Boolean v) { this.sameAsCurrentAddress = v; }
    @Deprecated public String getEmergencyContactName() { return emergencyContactName; }
    @Deprecated public void setEmergencyContactName(String v) { this.emergencyContactName = v; }
    @Deprecated public String getEmergencyContactRelationship() { return emergencyContactRelationship; }
    @Deprecated public void setEmergencyContactRelationship(String v) { this.emergencyContactRelationship = v; }
    @Deprecated public String getEmergencyContactPhone() { return emergencyContactPhone; }
    @Deprecated public void setEmergencyContactPhone(String v) { this.emergencyContactPhone = v; }
    @Deprecated public String getEmergencyContactEmail() { return emergencyContactEmail; }
    @Deprecated public void setEmergencyContactEmail(String v) { this.emergencyContactEmail = v; }
    @Deprecated public String getAlternateEmergencyContactName() { return alternateEmergencyContactName; }
    @Deprecated public void setAlternateEmergencyContactName(String v) { this.alternateEmergencyContactName = v; }
    @Deprecated public String getAlternateEmergencyContactRelationship() { return alternateEmergencyContactRelationship; }
    @Deprecated public void setAlternateEmergencyContactRelationship(String v) { this.alternateEmergencyContactRelationship = v; }
    @Deprecated public String getAlternateEmergencyContactPhone() { return alternateEmergencyContactPhone; }
    @Deprecated public void setAlternateEmergencyContactPhone(String v) { this.alternateEmergencyContactPhone = v; }
    @Deprecated public String getBankName() { return bankName; }
    @Deprecated public void setBankName(String v) { this.bankName = v; }
    @Deprecated public String getBankAccountNumber() { return bankAccountNumber; }
    @Deprecated public void setBankAccountNumber(String v) { this.bankAccountNumber = v; }
    @Deprecated public String getBankAccountHolderName() { return bankAccountHolderName; }
    @Deprecated public void setBankAccountHolderName(String v) { this.bankAccountHolderName = v; }
    @Deprecated public String getBankIfscCode() { return bankIfscCode; }
    @Deprecated public void setBankIfscCode(String v) { this.bankIfscCode = v; }
    @Deprecated public String getBankSwiftCode() { return bankSwiftCode; }
    @Deprecated public void setBankSwiftCode(String v) { this.bankSwiftCode = v; }
    @Deprecated public String getBankBranch() { return bankBranch; }
    @Deprecated public void setBankBranch(String v) { this.bankBranch = v; }
    @Deprecated public String getTaxId() { return taxId; }
    @Deprecated public void setTaxId(String v) { this.taxId = v; }
    @Deprecated public String getTaxFilingStatus() { return taxFilingStatus; }
    @Deprecated public void setTaxFilingStatus(String v) { this.taxFilingStatus = v; }
    @Deprecated public String getSsnLastFour() { return ssnLastFour; }
    @Deprecated public void setSsnLastFour(String v) { this.ssnLastFour = v; }
    @Deprecated public String getPassportNumber() { return passportNumber; }
    @Deprecated public void setPassportNumber(String v) { this.passportNumber = v; }
    @Deprecated public LocalDate getPassportExpiryDate() { return passportExpiryDate; }
    @Deprecated public void setPassportExpiryDate(LocalDate v) { this.passportExpiryDate = v; }
    @Deprecated public String getPassportIssuingCountry() { return passportIssuingCountry; }
    @Deprecated public void setPassportIssuingCountry(String v) { this.passportIssuingCountry = v; }
    @Deprecated public String getVisaType() { return visaType; }
    @Deprecated public void setVisaType(String v) { this.visaType = v; }
    @Deprecated public LocalDate getVisaExpiryDate() { return visaExpiryDate; }
    @Deprecated public void setVisaExpiryDate(LocalDate v) { this.visaExpiryDate = v; }
    @Deprecated public String getWorkPermitNumber() { return workPermitNumber; }
    @Deprecated public void setWorkPermitNumber(String v) { this.workPermitNumber = v; }
    @Deprecated public LocalDate getWorkPermitExpiryDate() { return workPermitExpiryDate; }
    @Deprecated public void setWorkPermitExpiryDate(LocalDate v) { this.workPermitExpiryDate = v; }
    @Deprecated public String getPanNumber() { return panNumber; }
    @Deprecated public void setPanNumber(String v) { this.panNumber = v; }
    @Deprecated public String getAadharNumberLastFour() { return aadharNumberLastFour; }
    @Deprecated public void setAadharNumberLastFour(String v) { this.aadharNumberLastFour = v; }
    @Deprecated public String getUanNumber() { return uanNumber; }
    @Deprecated public void setUanNumber(String v) { this.uanNumber = v; }
    @Deprecated public String getDriversLicenseNumber() { return driversLicenseNumber; }
    @Deprecated public void setDriversLicenseNumber(String v) { this.driversLicenseNumber = v; }
    @Deprecated public String getDriversLicenseState() { return driversLicenseState; }
    @Deprecated public void setDriversLicenseState(String v) { this.driversLicenseState = v; }
    @Deprecated public LocalDate getDriversLicenseExpiry() { return driversLicenseExpiry; }
    @Deprecated public void setDriversLicenseExpiry(LocalDate v) { this.driversLicenseExpiry = v; }

    // Compatibility aliases
    @Deprecated public String getCurrency() { return salaryCurrency; }
    @Deprecated public void setCurrency(String currency) { this.salaryCurrency = currency; }
    @Deprecated public String getIfscCode() { return bankIfscCode; }
    @Deprecated public void setIfscCode(String ifscCode) { this.bankIfscCode = ifscCode; }
    @Deprecated public String getSwiftCode() { return bankSwiftCode; }
    @Deprecated public void setSwiftCode(String swiftCode) { this.bankSwiftCode = swiftCode; }
    @Deprecated public String getLinkedInProfile() { return linkedinProfile; }
    @Deprecated public void setLinkedInProfile(String linkedInProfile) { this.linkedinProfile = linkedInProfile; }
    @Deprecated public Boolean getRehireEligible() { return isRehireEligible != null ? isRehireEligible : rehireEligible; }
    @Deprecated public void setRehireEligible(Boolean rehireEligible) { this.rehireEligible = rehireEligible; this.isRehireEligible = rehireEligible; }
    @Deprecated public String getLanguagesKnown() { return languagesKnown != null ? languagesKnown : languagesSpoken; }
    @Deprecated public void setLanguagesKnown(String languagesKnown) { this.languagesKnown = languagesKnown; this.languagesSpoken = languagesKnown; }
    @Deprecated public String getHobbies() { return hobbies; }
    @Deprecated public void setHobbies(String hobbies) { this.hobbies = hobbies; }
    @Deprecated public String getNotes() { return notes; }
    @Deprecated public void setNotes(String notes) { this.notes = notes; }

    // ==================== Helper Methods ====================

    public boolean isDeleted() {
        return deletedAt != null;
    }

    public boolean isOnboardingCompleted() {
        return "completed".equals(onboardingStatus) || Boolean.TRUE.equals(onboardingComplete);
    }

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

    public EmployeeAddress getPrimaryAddress() {
        return addresses.stream()
            .filter(a -> Boolean.TRUE.equals(a.getIsPrimary()) && Boolean.TRUE.equals(a.getIsCurrent()))
            .findFirst()
            .orElse(null);
    }

    public EmployeeBankAccount getPrimaryBankAccount() {
        return bankAccounts.stream()
            .filter(b -> Boolean.TRUE.equals(b.getIsPrimary()) && Boolean.TRUE.equals(b.getIsActive()))
            .findFirst()
            .orElse(null);
    }

    public EmployeeEmergencyContact getPrimaryEmergencyContact() {
        return emergencyContacts.stream()
            .filter(c -> Boolean.TRUE.equals(c.getIsPrimary()))
            .findFirst()
            .orElse(null);
    }

    /**
     * Get current tax info for a specific country
     */
    public EmployeeTaxInfo getCurrentTaxInfo(String countryCode) {
        return taxInfoRecords.stream()
            .filter(t -> Boolean.TRUE.equals(t.getIsCurrent()) &&
                        t.getTaxCountryCode() != null &&
                        t.getTaxCountryCode().equalsIgnoreCase(countryCode))
            .findFirst()
            .orElse(null);
    }

    /**
     * Check if employee has tax info submitted
     */
    public boolean hasTaxInfoSubmitted() {
        return taxInfoRecords.stream()
            .anyMatch(t -> Boolean.TRUE.equals(t.getIsCurrent()));
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

    @Override
    public String toString() {
        return "Employee{" +
                "id=" + id +
                ", employeeCode='" + employeeCode + '\'' +
                ", name='" + getFullName() + '\'' +
                ", status='" + employmentStatus + '\'' +
                '}';
    }
}
