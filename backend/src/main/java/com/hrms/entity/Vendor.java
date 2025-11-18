package com.hrms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "vendors")
public class Vendor {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    // Vendor Information
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "vendor_code", unique = true, nullable = false, length = 50)
    private String vendorCode;

    @Column(name = "vendor_type", nullable = false, length = 50)
    private String vendorType;  // staffing, consulting, contractor, freelance

    // Contact Information
    @Column(name = "primary_contact_name")
    private String primaryContactName;

    @Column(name = "primary_contact_email")
    private String primaryContactEmail;

    @Column(name = "primary_contact_phone", length = 50)
    private String primaryContactPhone;

    @Column(name = "address_line1")
    private String addressLine1;

    @Column(name = "address_line2")
    private String addressLine2;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    // Business Details
    @Column(name = "tax_id", length = 50)
    private String taxId;

    @Column(name = "business_registration_number", length = 100)
    private String businessRegistrationNumber;

    @Column(name = "website")
    private String website;

    // Contract Details
    @Column(name = "contract_start_date")
    private LocalDate contractStartDate;

    @Column(name = "contract_end_date")
    private LocalDate contractEndDate;

    @Column(name = "contract_status", nullable = false, length = 50)
    private String contractStatus = "active";  // active, expired, terminated, suspended

    @Column(name = "contract_document_id")
    private UUID contractDocumentId;

    // Billing Configuration
    @Column(name = "billing_type", nullable = false, length = 50)
    private String billingType;  // hourly, daily, monthly, project, fixed

    @Column(name = "default_billing_rate", precision = 10, scale = 2)
    private BigDecimal defaultBillingRate;

    @Column(name = "billing_currency", length = 10)
    private String billingCurrency = "USD";

    @Column(name = "payment_terms", length = 100)
    private String paymentTerms;

    // Multi-tier Support
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_vendor_id")
    private Vendor parentVendor;

    @Column(name = "tier_level")
    private Integer tierLevel = 1;

    @OneToMany(mappedBy = "parentVendor", fetch = FetchType.LAZY)
    private Set<Vendor> subVendors = new HashSet<>();

    // Performance Tracking
    @Column(name = "performance_rating", precision = 3, scale = 2)
    private BigDecimal performanceRating;

    @Column(name = "total_resources_supplied")
    private Integer totalResourcesSupplied = 0;

    @Column(name = "active_resources_count")
    private Integer activeResourcesCount = 0;

    // Status
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "is_preferred", nullable = false)
    private Boolean isPreferred = false;

    @Column(name = "blacklisted", nullable = false)
    private Boolean blacklisted = false;

    @Column(name = "blacklist_reason", length = 500)
    private String blacklistReason;

    // Metadata
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

    public Vendor() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getVendorCode() {
        return vendorCode;
    }

    public void setVendorCode(String vendorCode) {
        this.vendorCode = vendorCode;
    }

    public String getVendorType() {
        return vendorType;
    }

    public void setVendorType(String vendorType) {
        this.vendorType = vendorType;
    }

    public String getPrimaryContactName() {
        return primaryContactName;
    }

    public void setPrimaryContactName(String primaryContactName) {
        this.primaryContactName = primaryContactName;
    }

    public String getPrimaryContactEmail() {
        return primaryContactEmail;
    }

    public void setPrimaryContactEmail(String primaryContactEmail) {
        this.primaryContactEmail = primaryContactEmail;
    }

    public String getPrimaryContactPhone() {
        return primaryContactPhone;
    }

    public void setPrimaryContactPhone(String primaryContactPhone) {
        this.primaryContactPhone = primaryContactPhone;
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

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getTaxId() {
        return taxId;
    }

    public void setTaxId(String taxId) {
        this.taxId = taxId;
    }

    public String getBusinessRegistrationNumber() {
        return businessRegistrationNumber;
    }

    public void setBusinessRegistrationNumber(String businessRegistrationNumber) {
        this.businessRegistrationNumber = businessRegistrationNumber;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public LocalDate getContractStartDate() {
        return contractStartDate;
    }

    public void setContractStartDate(LocalDate contractStartDate) {
        this.contractStartDate = contractStartDate;
    }

    public LocalDate getContractEndDate() {
        return contractEndDate;
    }

    public void setContractEndDate(LocalDate contractEndDate) {
        this.contractEndDate = contractEndDate;
    }

    public String getContractStatus() {
        return contractStatus;
    }

    public void setContractStatus(String contractStatus) {
        this.contractStatus = contractStatus;
    }

    public UUID getContractDocumentId() {
        return contractDocumentId;
    }

    public void setContractDocumentId(UUID contractDocumentId) {
        this.contractDocumentId = contractDocumentId;
    }

    public String getBillingType() {
        return billingType;
    }

    public void setBillingType(String billingType) {
        this.billingType = billingType;
    }

    public BigDecimal getDefaultBillingRate() {
        return defaultBillingRate;
    }

    public void setDefaultBillingRate(BigDecimal defaultBillingRate) {
        this.defaultBillingRate = defaultBillingRate;
    }

    public String getBillingCurrency() {
        return billingCurrency;
    }

    public void setBillingCurrency(String billingCurrency) {
        this.billingCurrency = billingCurrency;
    }

    public String getPaymentTerms() {
        return paymentTerms;
    }

    public void setPaymentTerms(String paymentTerms) {
        this.paymentTerms = paymentTerms;
    }

    public Vendor getParentVendor() {
        return parentVendor;
    }

    public void setParentVendor(Vendor parentVendor) {
        this.parentVendor = parentVendor;
    }

    public Integer getTierLevel() {
        return tierLevel;
    }

    public void setTierLevel(Integer tierLevel) {
        this.tierLevel = tierLevel;
    }

    public Set<Vendor> getSubVendors() {
        return subVendors;
    }

    public void setSubVendors(Set<Vendor> subVendors) {
        this.subVendors = subVendors;
    }

    public BigDecimal getPerformanceRating() {
        return performanceRating;
    }

    public void setPerformanceRating(BigDecimal performanceRating) {
        this.performanceRating = performanceRating;
    }

    public Integer getTotalResourcesSupplied() {
        return totalResourcesSupplied;
    }

    public void setTotalResourcesSupplied(Integer totalResourcesSupplied) {
        this.totalResourcesSupplied = totalResourcesSupplied;
    }

    public Integer getActiveResourcesCount() {
        return activeResourcesCount;
    }

    public void setActiveResourcesCount(Integer activeResourcesCount) {
        this.activeResourcesCount = activeResourcesCount;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getIsPreferred() {
        return isPreferred;
    }

    public void setIsPreferred(Boolean isPreferred) {
        this.isPreferred = isPreferred;
    }

    public Boolean getBlacklisted() {
        return blacklisted;
    }

    public void setBlacklisted(Boolean blacklisted) {
        this.blacklisted = blacklisted;
    }

    public String getBlacklistReason() {
        return blacklistReason;
    }

    public void setBlacklistReason(String blacklistReason) {
        this.blacklistReason = blacklistReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public User getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(User updatedBy) {
        this.updatedBy = updatedBy;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
