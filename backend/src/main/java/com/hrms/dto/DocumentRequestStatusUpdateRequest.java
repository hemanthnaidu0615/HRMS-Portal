package com.hrms.dto;

import jakarta.validation.constraints.NotBlank;

public class DocumentRequestStatusUpdateRequest {
    @NotBlank(message = "Status is required")
    private String status;

    public DocumentRequestStatusUpdateRequest() {
    }

    public DocumentRequestStatusUpdateRequest(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
