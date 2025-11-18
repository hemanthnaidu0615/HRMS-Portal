package com.hrms.dto.vendor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class VendorResponse {
    private UUID id;
    private String name;
    private String vendorCode;
    private String vendorType;
    private String primaryContactName;
    private String primaryContactEmail;
    private String primaryContactPhone;
    private String contractStatus;
    private LocalDate contractStartDate;
    private LocalDate contractEndDate;
    private String billingType;
    private BigDecimal defaultBillingRate;
    private String billingCurrency;
    private String paymentTerms;
    private UUID parentVendorId;
    private String parentVendorName;
    private Integer tierLevel;
    private BigDecimal performanceRating;
    private Integer totalResourcesSupplied;
    private Integer activeResourcesCount;
    private Boolean isActive;
    private Boolean isPreferred;
    private Boolean blacklisted;
    private String blacklistReason;
    private LocalDateTime createdAt;

    // Getters and Setters
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

    public String getContractStatus() {
        return contractStatus;
    }

    public void setContractStatus(String contractStatus) {
        this.contractStatus = contractStatus;
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

    public UUID getParentVendorId() {
        return parentVendorId;
    }

    public void setParentVendorId(UUID parentVendorId) {
        this.parentVendorId = parentVendorId;
    }

    public String getParentVendorName() {
        return parentVendorName;
    }

    public void setParentVendorName(String parentVendorName) {
        this.parentVendorName = parentVendorName;
    }

    public Integer getTierLevel() {
        return tierLevel;
    }

    public void setTierLevel(Integer tierLevel) {
        this.tierLevel = tierLevel;
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
}
