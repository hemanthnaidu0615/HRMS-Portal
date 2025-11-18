package com.hrms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vendor_assignments")
public class VendorAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    // Assignment Details
    @Column(name = "assignment_type", nullable = false, length = 50)
    private String assignmentType;  // direct, sub-contract, temporary, permanent

    @Column(name = "assignment_start_date", nullable = false)
    private LocalDate assignmentStartDate;

    @Column(name = "assignment_end_date")
    private LocalDate assignmentEndDate;

    @Column(name = "assignment_status", nullable = false, length = 50)
    private String assignmentStatus = "active";  // active, completed, terminated

    // Project/Client Assignment (optional)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    // Financial Terms
    @Column(name = "billing_rate", precision = 10, scale = 2)
    private BigDecimal billingRate;

    @Column(name = "billing_rate_type", length = 50)
    private String billingRateType;  // hourly, daily, monthly, fixed

    @Column(name = "billing_currency", length = 10)
    private String billingCurrency = "USD";

    @Column(name = "markup_percentage", precision = 5, scale = 2)
    private BigDecimal markupPercentage;

    // Cost to your org from vendor
    @Column(name = "vendor_cost_rate", precision = 10, scale = 2)
    private BigDecimal vendorCostRate;

    // Revenue from client (if applicable)
    @Column(name = "client_billing_rate", precision = 10, scale = 2)
    private BigDecimal clientBillingRate;

    // Multi-tier tracking
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_vendor_id")
    private Vendor sourceVendor;  // If employee came via sub-vendor

    @Column(name = "vendor_chain", length = 500)
    private String vendorChain;  // JSON array of vendor hierarchy

    // Performance
    @Column(name = "performance_rating", precision = 3, scale = 2)
    private BigDecimal performanceRating;

    @Column(name = "feedback_notes", length = 2000)
    private String feedbackNotes;

    // Termination details
    @Column(name = "termination_date")
    private LocalDate terminationDate;

    @Column(name = "termination_reason", length = 500)
    private String terminationReason;

    @Column(name = "termination_initiated_by", length = 50)
    private String terminationInitiatedBy;  // vendor, client, organization, employee

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

    public VendorAssignment() {
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

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public Vendor getVendor() {
        return vendor;
    }

    public void setVendor(Vendor vendor) {
        this.vendor = vendor;
    }

    public String getAssignmentType() {
        return assignmentType;
    }

    public void setAssignmentType(String assignmentType) {
        this.assignmentType = assignmentType;
    }

    public LocalDate getAssignmentStartDate() {
        return assignmentStartDate;
    }

    public void setAssignmentStartDate(LocalDate assignmentStartDate) {
        this.assignmentStartDate = assignmentStartDate;
    }

    public LocalDate getAssignmentEndDate() {
        return assignmentEndDate;
    }

    public void setAssignmentEndDate(LocalDate assignmentEndDate) {
        this.assignmentEndDate = assignmentEndDate;
    }

    public String getAssignmentStatus() {
        return assignmentStatus;
    }

    public void setAssignmentStatus(String assignmentStatus) {
        this.assignmentStatus = assignmentStatus;
    }

    public Client getClient() {
        return client;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public BigDecimal getBillingRate() {
        return billingRate;
    }

    public void setBillingRate(BigDecimal billingRate) {
        this.billingRate = billingRate;
    }

    public String getBillingRateType() {
        return billingRateType;
    }

    public void setBillingRateType(String billingRateType) {
        this.billingRateType = billingRateType;
    }

    public String getBillingCurrency() {
        return billingCurrency;
    }

    public void setBillingCurrency(String billingCurrency) {
        this.billingCurrency = billingCurrency;
    }

    public BigDecimal getMarkupPercentage() {
        return markupPercentage;
    }

    public void setMarkupPercentage(BigDecimal markupPercentage) {
        this.markupPercentage = markupPercentage;
    }

    public BigDecimal getVendorCostRate() {
        return vendorCostRate;
    }

    public void setVendorCostRate(BigDecimal vendorCostRate) {
        this.vendorCostRate = vendorCostRate;
    }

    public BigDecimal getClientBillingRate() {
        return clientBillingRate;
    }

    public void setClientBillingRate(BigDecimal clientBillingRate) {
        this.clientBillingRate = clientBillingRate;
    }

    public Vendor getSourceVendor() {
        return sourceVendor;
    }

    public void setSourceVendor(Vendor sourceVendor) {
        this.sourceVendor = sourceVendor;
    }

    public String getVendorChain() {
        return vendorChain;
    }

    public void setVendorChain(String vendorChain) {
        this.vendorChain = vendorChain;
    }

    public BigDecimal getPerformanceRating() {
        return performanceRating;
    }

    public void setPerformanceRating(BigDecimal performanceRating) {
        this.performanceRating = performanceRating;
    }

    public String getFeedbackNotes() {
        return feedbackNotes;
    }

    public void setFeedbackNotes(String feedbackNotes) {
        this.feedbackNotes = feedbackNotes;
    }

    public LocalDate getTerminationDate() {
        return terminationDate;
    }

    public void setTerminationDate(LocalDate terminationDate) {
        this.terminationDate = terminationDate;
    }

    public String getTerminationReason() {
        return terminationReason;
    }

    public void setTerminationReason(String terminationReason) {
        this.terminationReason = terminationReason;
    }

    public String getTerminationInitiatedBy() {
        return terminationInitiatedBy;
    }

    public void setTerminationInitiatedBy(String terminationInitiatedBy) {
        this.terminationInitiatedBy = terminationInitiatedBy;
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

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
