package com.hrms.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class UpdateOrganizationModulesRequest {

    @NotNull
    private String moduleName;

    @NotNull
    private Boolean isEnabled;

    private Integer userLimit;

    private LocalDate expiryDate;

    // Constructors
    public UpdateOrganizationModulesRequest() {
    }

    public UpdateOrganizationModulesRequest(String moduleName, Boolean isEnabled, Integer userLimit, LocalDate expiryDate) {
        this.moduleName = moduleName;
        this.isEnabled = isEnabled;
        this.userLimit = userLimit;
        this.expiryDate = expiryDate;
    }

    // Getters and Setters
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
}
