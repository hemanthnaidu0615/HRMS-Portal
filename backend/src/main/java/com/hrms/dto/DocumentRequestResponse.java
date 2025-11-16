package com.hrms.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class DocumentRequestResponse {
    private UUID id;
    private UUID requesterUserId;
    private UUID targetEmployeeId;
    private String message;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private UUID fulfilledDocumentId;

    public DocumentRequestResponse() {
    }

    public DocumentRequestResponse(UUID id, UUID requesterUserId, UUID targetEmployeeId, String message,
                                   String status, LocalDateTime createdAt, LocalDateTime completedAt,
                                   UUID fulfilledDocumentId) {
        this.id = id;
        this.requesterUserId = requesterUserId;
        this.targetEmployeeId = targetEmployeeId;
        this.message = message;
        this.status = status;
        this.createdAt = createdAt;
        this.completedAt = completedAt;
        this.fulfilledDocumentId = fulfilledDocumentId;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getRequesterUserId() {
        return requesterUserId;
    }

    public void setRequesterUserId(UUID requesterUserId) {
        this.requesterUserId = requesterUserId;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public UUID getFulfilledDocumentId() {
        return fulfilledDocumentId;
    }

    public void setFulfilledDocumentId(UUID fulfilledDocumentId) {
        this.fulfilledDocumentId = fulfilledDocumentId;
    }
}
