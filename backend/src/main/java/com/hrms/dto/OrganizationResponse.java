package com.hrms.dto;

import com.hrms.entity.Organization;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for organization data.
 * Used for returning organization information to clients.
 */
public class OrganizationResponse {

    private UUID id;
    private String name;

    // Business Details
    private String industry;
    private String organizationSize;
    private String registrationNumber;
    private String taxId;

    // Contact Information
    private String email;
    private String phone;
    private String website;

    // Address
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String country;
    private String countryCode;
    private String postalCode;
    private String fullAddress;

    // Configuration
    private String timezone;
    private String defaultCurrency;
    private String dateFormat;
    private Integer fiscalYearStartMonth;

    // Subscription
    private String subscriptionPlan;
    private String subscriptionStatus;
    private LocalDate subscriptionStartDate;
    private LocalDate subscriptionEndDate;
    private Integer maxEmployees;
    private Boolean subscriptionActive;

    // Status
    private Boolean isActive;
    private Boolean isDeleted;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    // Metrics (optional, populated when needed)
    private Long employeeCount;
    private Long departmentCount;
    private Long activeUserCount;
    private Long documentCount;
    private Long orgAdminCount;

    // ==================== Constructors ====================

    public OrganizationResponse() {
    }

    /**
     * Create response from Organization entity
     */
    public static OrganizationResponse fromEntity(Organization org) {
        OrganizationResponse response = new OrganizationResponse();
        response.setId(org.getId());
        response.setName(org.getName());

        // Business Details
        response.setIndustry(org.getIndustry());
        response.setOrganizationSize(org.getOrganizationSize());
        response.setRegistrationNumber(org.getRegistrationNumber());
        response.setTaxId(org.getTaxId());

        // Contact
        response.setEmail(org.getEmail());
        response.setPhone(org.getPhone());
        response.setWebsite(org.getWebsite());

        // Address
        response.setAddressLine1(org.getAddressLine1());
        response.setAddressLine2(org.getAddressLine2());
        response.setCity(org.getCity());
        response.setState(org.getState());
        response.setCountry(org.getCountry());
        response.setCountryCode(org.getCountryCode());
        response.setPostalCode(org.getPostalCode());
        response.setFullAddress(org.getFullAddress());

        // Configuration
        response.setTimezone(org.getTimezone());
        response.setDefaultCurrency(org.getDefaultCurrency());
        response.setDateFormat(org.getDateFormat());
        response.setFiscalYearStartMonth(org.getFiscalYearStartMonth());

        // Subscription
        response.setSubscriptionPlan(org.getSubscriptionPlan());
        response.setSubscriptionStatus(org.getSubscriptionStatus());
        response.setSubscriptionStartDate(org.getSubscriptionStartDate());
        response.setSubscriptionEndDate(org.getSubscriptionEndDate());
        response.setMaxEmployees(org.getMaxEmployees());
        response.setSubscriptionActive(org.isSubscriptionActive());

        // Status
        response.setIsActive(org.getIsActive());
        response.setIsDeleted(org.isDeleted());

        // Audit
        response.setCreatedAt(org.getCreatedAt());
        response.setUpdatedAt(org.getUpdatedAt());
        response.setDeletedAt(org.getDeletedAt());

        return response;
    }

    /**
     * Add metrics to the response
     */
    public OrganizationResponse withMetrics(Long employeeCount, Long departmentCount,
                                            Long activeUserCount, Long documentCount,
                                            Long orgAdminCount) {
        this.employeeCount = employeeCount;
        this.departmentCount = departmentCount;
        this.activeUserCount = activeUserCount;
        this.documentCount = documentCount;
        this.orgAdminCount = orgAdminCount;
        return this;
    }

    // ==================== Getters and Setters ====================

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getOrganizationSize() {
        return organizationSize;
    }

    public void setOrganizationSize(String organizationSize) {
        this.organizationSize = organizationSize;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public String getTaxId() {
        return taxId;
    }

    public void setTaxId(String taxId) {
        this.taxId = taxId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getAddressLine1() {
        return addressLine1;
    }

    public void setAddressLine1(String addressLine1) {
        this.addressLine1 = addressLine1;
    }

    public String getAddressLine2() {
        return addressLine2;
    }

    public void setAddressLine2(String addressLine2) {
        this.addressLine2 = addressLine2;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getCountryCode() {
        return countryCode;
    }

    public void setCountryCode(String countryCode) {
        this.countryCode = countryCode;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getFullAddress() {
        return fullAddress;
    }

    public void setFullAddress(String fullAddress) {
        this.fullAddress = fullAddress;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public String getDefaultCurrency() {
        return defaultCurrency;
    }

    public void setDefaultCurrency(String defaultCurrency) {
        this.defaultCurrency = defaultCurrency;
    }

    public String getDateFormat() {
        return dateFormat;
    }

    public void setDateFormat(String dateFormat) {
        this.dateFormat = dateFormat;
    }

    public Integer getFiscalYearStartMonth() {
        return fiscalYearStartMonth;
    }

    public void setFiscalYearStartMonth(Integer fiscalYearStartMonth) {
        this.fiscalYearStartMonth = fiscalYearStartMonth;
    }

    public String getSubscriptionPlan() {
        return subscriptionPlan;
    }

    public void setSubscriptionPlan(String subscriptionPlan) {
        this.subscriptionPlan = subscriptionPlan;
    }

    public String getSubscriptionStatus() {
        return subscriptionStatus;
    }

    public void setSubscriptionStatus(String subscriptionStatus) {
        this.subscriptionStatus = subscriptionStatus;
    }

    public LocalDate getSubscriptionStartDate() {
        return subscriptionStartDate;
    }

    public void setSubscriptionStartDate(LocalDate subscriptionStartDate) {
        this.subscriptionStartDate = subscriptionStartDate;
    }

    public LocalDate getSubscriptionEndDate() {
        return subscriptionEndDate;
    }

    public void setSubscriptionEndDate(LocalDate subscriptionEndDate) {
        this.subscriptionEndDate = subscriptionEndDate;
    }

    public Integer getMaxEmployees() {
        return maxEmployees;
    }

    public void setMaxEmployees(Integer maxEmployees) {
        this.maxEmployees = maxEmployees;
    }

    public Boolean getSubscriptionActive() {
        return subscriptionActive;
    }

    public void setSubscriptionActive(Boolean subscriptionActive) {
        this.subscriptionActive = subscriptionActive;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }

    public Long getEmployeeCount() {
        return employeeCount;
    }

    public void setEmployeeCount(Long employeeCount) {
        this.employeeCount = employeeCount;
    }

    public Long getDepartmentCount() {
        return departmentCount;
    }

    public void setDepartmentCount(Long departmentCount) {
        this.departmentCount = departmentCount;
    }

    public Long getActiveUserCount() {
        return activeUserCount;
    }

    public void setActiveUserCount(Long activeUserCount) {
        this.activeUserCount = activeUserCount;
    }

    public Long getDocumentCount() {
        return documentCount;
    }

    public void setDocumentCount(Long documentCount) {
        this.documentCount = documentCount;
    }

    public Long getOrgAdminCount() {
        return orgAdminCount;
    }

    public void setOrgAdminCount(Long orgAdminCount) {
        this.orgAdminCount = orgAdminCount;
    }
}
