package com.hrms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "projects")
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    // Project Information
    @Column(name = "project_name", nullable = false)
    private String projectName;

    @Column(name = "project_code", unique = true, nullable = false, length = 50)
    private String projectCode;

    @Column(name = "project_type", length = 50)
    private String projectType;  // fixed-price, time-material, retainer

    @Column(name = "description", length = 2000)
    private String description;

    // Timeline
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "estimated_duration_months")
    private Integer estimatedDurationMonths;

    @Column(name = "project_status", nullable = false, length = 50)
    private String projectStatus = "active";  // active, completed, on-hold, cancelled

    // Financial
    @Column(name = "project_budget", precision = 15, scale = 2)
    private BigDecimal projectBudget;

    @Column(name = "billing_rate_type", length = 50)
    private String billingRateType;  // hourly, daily, monthly, fixed

    @Column(name = "default_billing_rate", precision = 10, scale = 2)
    private BigDecimal defaultBillingRate;

    @Column(name = "currency", length = 10)
    private String currency = "USD";

    // Management
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_manager_id")
    private Employee projectManager;

    // Metrics
    @Column(name = "total_allocated_resources")
    private Integer totalAllocatedResources = 0;

    @Column(name = "total_hours_logged", precision = 10, scale = 2)
    private BigDecimal totalHoursLogged = BigDecimal.ZERO;

    @Column(name = "total_revenue", precision = 15, scale = 2)
    private BigDecimal totalRevenue = BigDecimal.ZERO;

    // Status
    @Column(name = "is_billable", nullable = false)
    private Boolean isBillable = true;

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

    public Project() {
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

    public Client getClient() {
        return client;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getProjectCode() {
        return projectCode;
    }

    public void setProjectCode(String projectCode) {
        this.projectCode = projectCode;
    }

    public String getProjectType() {
        return projectType;
    }

    public void setProjectType(String projectType) {
        this.projectType = projectType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Integer getEstimatedDurationMonths() {
        return estimatedDurationMonths;
    }

    public void setEstimatedDurationMonths(Integer estimatedDurationMonths) {
        this.estimatedDurationMonths = estimatedDurationMonths;
    }

    public String getProjectStatus() {
        return projectStatus;
    }

    public void setProjectStatus(String projectStatus) {
        this.projectStatus = projectStatus;
    }

    public BigDecimal getProjectBudget() {
        return projectBudget;
    }

    public void setProjectBudget(BigDecimal projectBudget) {
        this.projectBudget = projectBudget;
    }

    public String getBillingRateType() {
        return billingRateType;
    }

    public void setBillingRateType(String billingRateType) {
        this.billingRateType = billingRateType;
    }

    public BigDecimal getDefaultBillingRate() {
        return defaultBillingRate;
    }

    public void setDefaultBillingRate(BigDecimal defaultBillingRate) {
        this.defaultBillingRate = defaultBillingRate;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public Employee getProjectManager() {
        return projectManager;
    }

    public void setProjectManager(Employee projectManager) {
        this.projectManager = projectManager;
    }

    public Integer getTotalAllocatedResources() {
        return totalAllocatedResources;
    }

    public void setTotalAllocatedResources(Integer totalAllocatedResources) {
        this.totalAllocatedResources = totalAllocatedResources;
    }

    public BigDecimal getTotalHoursLogged() {
        return totalHoursLogged;
    }

    public void setTotalHoursLogged(BigDecimal totalHoursLogged) {
        this.totalHoursLogged = totalHoursLogged;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Boolean getIsBillable() {
        return isBillable;
    }

    public void setIsBillable(Boolean isBillable) {
        this.isBillable = isBillable;
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
