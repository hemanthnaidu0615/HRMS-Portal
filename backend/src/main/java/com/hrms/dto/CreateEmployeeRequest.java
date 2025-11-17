package com.hrms.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class CreateEmployeeRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Temporary password is required")
    private String temporaryPassword;

    // Personal details
    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    // Organization assignment
    private UUID departmentId;
    private UUID positionId;
    private UUID reportsToId;

    // Employment details
    private String employmentType = "internal";  // internal, contract, client
    private String clientName;
    private String projectId;
    private LocalDate contractEndDate;

    // Probation period
    private Boolean isProbation = false;
    private LocalDate probationStartDate;
    private LocalDate probationEndDate;
    private String probationStatus;

    // Permission groups
    private List<UUID> permissionGroupIds;

    public CreateEmployeeRequest() {
    }

    public CreateEmployeeRequest(String email, String temporaryPassword) {
        this.email = email;
        this.temporaryPassword = temporaryPassword;
    }

    // Getters and setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTemporaryPassword() {
        return temporaryPassword;
    }

    public void setTemporaryPassword(String temporaryPassword) {
        this.temporaryPassword = temporaryPassword;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public UUID getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(UUID departmentId) {
        this.departmentId = departmentId;
    }

    public UUID getPositionId() {
        return positionId;
    }

    public void setPositionId(UUID positionId) {
        this.positionId = positionId;
    }

    public UUID getReportsToId() {
        return reportsToId;
    }

    public void setReportsToId(UUID reportsToId) {
        this.reportsToId = reportsToId;
    }

    public String getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public LocalDate getContractEndDate() {
        return contractEndDate;
    }

    public void setContractEndDate(LocalDate contractEndDate) {
        this.contractEndDate = contractEndDate;
    }

    public Boolean getIsProbation() {
        return isProbation;
    }

    public void setIsProbation(Boolean isProbation) {
        this.isProbation = isProbation;
    }

    public LocalDate getProbationStartDate() {
        return probationStartDate;
    }

    public void setProbationStartDate(LocalDate probationStartDate) {
        this.probationStartDate = probationStartDate;
    }

    public LocalDate getProbationEndDate() {
        return probationEndDate;
    }

    public void setProbationEndDate(LocalDate probationEndDate) {
        this.probationEndDate = probationEndDate;
    }

    public String getProbationStatus() {
        return probationStatus;
    }

    public void setProbationStatus(String probationStatus) {
        this.probationStatus = probationStatus;
    }

    public List<UUID> getPermissionGroupIds() {
        return permissionGroupIds;
    }

    public void setPermissionGroupIds(List<UUID> permissionGroupIds) {
        this.permissionGroupIds = permissionGroupIds;
    }
}
