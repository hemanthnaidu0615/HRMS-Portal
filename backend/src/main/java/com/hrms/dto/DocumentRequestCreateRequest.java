package com.hrms.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class DocumentRequestCreateRequest {
    @NotNull(message = "Target employee ID is required")
    private UUID targetEmployeeId;

    private String message;

    public DocumentRequestCreateRequest() {
    }

    public DocumentRequestCreateRequest(UUID targetEmployeeId, String message) {
        this.targetEmployeeId = targetEmployeeId;
        this.message = message;
    }

    public UUID getTargetEmployeeId() {
        return targetEmployeeId;
    }

    public void setTargetEmployeeId(UUID targetEmployeeId) {
        this.targetEmployeeId = targetEmployeeId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
