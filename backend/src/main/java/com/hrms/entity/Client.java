package com.hrms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "clients")
public class Client {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    // Client Information
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "client_code", unique = true, nullable = false, length = 50)
    private String clientCode;

    @Column(name = "client_type", nullable = false, length = 50)
    private String clientType;  // corporate, government, nonprofit, individual

    @Column(name = "industry", length = 100)
    private String industry;

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

    @Column(name = "website")
    private String website;

    // Relationship Details
    @Column(name = "relationship_start_date")
    private LocalDate relationshipStartDate;

    @Column(name = "relationship_status", nullable = false, length = 50)
    private String relationshipStatus = "active";  // active, inactive, prospect

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_manager_id")
    private Employee accountManager;

    // Business Metrics
    @Column(name = "total_active_projects")
    private Integer totalActiveProjects = 0;

    @Column(name = "total_active_resources")
    private Integer totalActiveResources = 0;

    @Column(name = "lifetime_revenue", precision = 15, scale = 2)
    private BigDecimal lifetimeRevenue = BigDecimal.ZERO;

    // Status
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "is_strategic", nullable = false)
    private Boolean isStrategic = false;

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

    public Client() {
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

    public String getClientCode() {
        return clientCode;
    }

    public void setClientCode(String clientCode) {
        this.clientCode = clientCode;
    }

    public String getClientType() {
        return clientType;
    }

    public void setClientType(String clientType) {
        this.clientType = clientType;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
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

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public LocalDate getRelationshipStartDate() {
        return relationshipStartDate;
    }

    public void setRelationshipStartDate(LocalDate relationshipStartDate) {
        this.relationshipStartDate = relationshipStartDate;
    }

    public String getRelationshipStatus() {
        return relationshipStatus;
    }

    public void setRelationshipStatus(String relationshipStatus) {
        this.relationshipStatus = relationshipStatus;
    }

    public Employee getAccountManager() {
        return accountManager;
    }

    public void setAccountManager(Employee accountManager) {
        this.accountManager = accountManager;
    }

    public Integer getTotalActiveProjects() {
        return totalActiveProjects;
    }

    public void setTotalActiveProjects(Integer totalActiveProjects) {
        this.totalActiveProjects = totalActiveProjects;
    }

    public Integer getTotalActiveResources() {
        return totalActiveResources;
    }

    public void setTotalActiveResources(Integer totalActiveResources) {
        this.totalActiveResources = totalActiveResources;
    }

    public BigDecimal getLifetimeRevenue() {
        return lifetimeRevenue;
    }

    public void setLifetimeRevenue(BigDecimal lifetimeRevenue) {
        this.lifetimeRevenue = lifetimeRevenue;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getIsStrategic() {
        return isStrategic;
    }

    public void setIsStrategic(Boolean isStrategic) {
        this.isStrategic = isStrategic;
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
