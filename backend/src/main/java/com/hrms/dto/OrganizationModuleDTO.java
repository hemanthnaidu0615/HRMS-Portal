package com.hrms.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class OrganizationModuleDTO {
    private Long id;
    private String moduleName;
    private Boolean isEnabled;
    private Integer userLimit;
    private LocalDate expiryDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public OrganizationModuleDTO() {
    }

    public OrganizationModuleDTO(Long id, String moduleName, Boolean isEnabled,
                                Integer userLimit, LocalDate expiryDate,
                                LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.moduleName = moduleName;
        this.isEnabled = isEnabled;
        this.userLimit = userLimit;
        this.expiryDate = expiryDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getModuleName() {
        return moduleName;
    }

    public void setModuleName(String moduleName) {
        this.moduleName = moduleName;
    }

    public Boolean getIsEnabled() {
        return isEnabled;
    }

    public void setIsEnabled(Boolean isEnabled) {
        this.isEnabled = isEnabled;
    }

    public Integer getUserLimit() {
        return userLimit;
    }

    public void setUserLimit(Integer userLimit) {
        this.userLimit = userLimit;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
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
}
