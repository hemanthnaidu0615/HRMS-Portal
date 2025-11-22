package com.hrms.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Organization entity representing a company/tenant in the multi-tenant HRMS system.
 * This is the root entity for all organizational data isolation.
 */
@Entity
@Table(name = "organizations")
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "Organization name is required")
    @Size(min = 2, max = 255, message = "Organization name must be between 2 and 255 characters")
    @Column(nullable = false, length = 255)
    private String name;

    // ==================== Business Details ====================

    @Size(max = 100, message = "Industry must not exceed 100 characters")
    @Column(length = 100)
    private String industry;

    @Size(max = 50, message = "Organization size must not exceed 50 characters")
    @Column(name = "organization_size", length = 50)
    private String organizationSize;

    @Size(max = 100, message = "Registration number must not exceed 100 characters")
    @Column(name = "registration_number", length = 100)
    private String registrationNumber;

    @Size(max = 100, message = "Tax ID must not exceed 100 characters")
    @Column(name = "tax_id", length = 100)
    private String taxId;

    // ==================== Contact Information ====================

    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    @Column(length = 255)
    private String email;

    @Size(max = 50, message = "Phone must not exceed 50 characters")
    @Column(length = 50)
    private String phone;

    @Size(max = 255, message = "Website must not exceed 255 characters")
    @Column(length = 255)
    private String website;

    @Size(max = 255, message = "Address line 1 must not exceed 255 characters")
    @Column(name = "address_line1", length = 255)
    private String addressLine1;

    @Size(max = 255, message = "Address line 2 must not exceed 255 characters")
    @Column(name = "address_line2", length = 255)
    private String addressLine2;

    @Size(max = 100, message = "City must not exceed 100 characters")
    @Column(length = 100)
    private String city;

    @Size(max = 100, message = "State must not exceed 100 characters")
    @Column(length = 100)
    private String state;

    @Size(max = 100, message = "Country must not exceed 100 characters")
    @Column(length = 100)
    private String country = "United States";

    @Size(max = 3, message = "Country code must not exceed 3 characters")
    @Column(name = "country_code", length = 3)
    private String countryCode = "USA";

    @Size(max = 20, message = "Postal code must not exceed 20 characters")
    @Column(name = "postal_code", length = 20)
    private String postalCode;

    // ==================== Configuration ====================

    @Size(max = 100, message = "Timezone must not exceed 100 characters")
    @Column(length = 100)
    private String timezone = "UTC";

    @Size(max = 10, message = "Currency must not exceed 10 characters")
    @Column(name = "default_currency", length = 10)
    private String defaultCurrency = "USD";

    @Size(max = 20, message = "Date format must not exceed 20 characters")
    @Column(name = "date_format", length = 20)
    private String dateFormat = "MM/DD/YYYY";

    @Min(value = 1, message = "Fiscal year start month must be between 1 and 12")
    @Max(value = 12, message = "Fiscal year start month must be between 1 and 12")
    @Column(name = "fiscal_year_start_month")
    private Integer fiscalYearStartMonth = 1;

    // ==================== Subscription ====================

    @Size(max = 50, message = "Subscription plan must not exceed 50 characters")
    @Column(name = "subscription_plan", length = 50)
    private String subscriptionPlan = "free";

    @Size(max = 50, message = "Subscription status must not exceed 50 characters")
    @Column(name = "subscription_status", length = 50)
    private String subscriptionStatus = "trial";

    @Column(name = "subscription_start_date")
    private LocalDate subscriptionStartDate;

    @Column(name = "subscription_end_date")
    private LocalDate subscriptionEndDate;

    @Min(value = 1, message = "Max employees must be at least 1")
    @Column(name = "max_employees")
    private Integer maxEmployees;

    // ==================== Status ====================

    @Column(name = "is_active")
    private Boolean isActive = true;

    // ==================== Audit Fields ====================

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private UUID updatedBy;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // ==================== Constructors ====================

    public Organization() {
    }

    public Organization(String name) {
        this.name = name;
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

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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

    public UUID getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(UUID updatedBy) {
        this.updatedBy = updatedBy;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }

    // ==================== Helper Methods ====================

    public boolean isDeleted() {
        return deletedAt != null;
    }

    public boolean isSubscriptionActive() {
        if (subscriptionEndDate == null) {
            return true; // No end date means active
        }
        return LocalDate.now().isBefore(subscriptionEndDate) || LocalDate.now().isEqual(subscriptionEndDate);
    }

    /**
     * Returns the full address as a formatted string
     */
    public String getFullAddress() {
        StringBuilder sb = new StringBuilder();
        if (addressLine1 != null && !addressLine1.isBlank()) {
            sb.append(addressLine1);
        }
        if (addressLine2 != null && !addressLine2.isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(addressLine2);
        }
        if (city != null && !city.isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(city);
        }
        if (state != null && !state.isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(state);
        }
        if (postalCode != null && !postalCode.isBlank()) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(postalCode);
        }
        if (country != null && !country.isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(country);
        }
        return sb.toString();
    }

    @Override
    public String toString() {
        return "Organization{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", industry='" + industry + '\'' +
                ", country='" + country + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}
