package com.hrms.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class DocumentRequestResponse {
    private UUID id;
    private UUID requesterUserId;
    private String requesterEmail;
    private String requesterFirstName;
    private String requesterLastName;
    private UUID targetEmployeeId;
    private String targetEmployeeEmail;
    private String targetEmployeeFirstName;
    private String targetEmployeeLastName;
    private String message;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private UUID fulfilledDocumentId;

    public DocumentRequestResponse() {
    }

    public DocumentRequestResponse(UUID id, UUID requesterUserId, String requesterEmail,
                                   String requesterFirstName, String requesterLastName,
                                   UUID targetEmployeeId, String targetEmployeeEmail,
                                   String targetEmployeeFirstName, String targetEmployeeLastName,
                                   String message, String status, LocalDateTime createdAt,
                                   LocalDateTime completedAt, UUID fulfilledDocumentId) {
        this.id = id;
        this.requesterUserId = requesterUserId;
        this.requesterEmail = requesterEmail;
        this.requesterFirstName = requesterFirstName;
        this.requesterLastName = requesterLastName;
        this.targetEmployeeId = targetEmployeeId;
        this.targetEmployeeEmail = targetEmployeeEmail;
        this.targetEmployeeFirstName = targetEmployeeFirstName;
        this.targetEmployeeLastName = targetEmployeeLastName;
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

    public String getRequesterEmail() {
        return requesterEmail;
    }

    public void setRequesterEmail(String requesterEmail) {
        this.requesterEmail = requesterEmail;
    }

    public String getRequesterFirstName() {
        return requesterFirstName;
    }

    public void setRequesterFirstName(String requesterFirstName) {
        this.requesterFirstName = requesterFirstName;
    }

    public String getRequesterLastName() {
        return requesterLastName;
    }

    public void setRequesterLastName(String requesterLastName) {
        this.requesterLastName = requesterLastName;
    }

    public UUID getTargetEmployeeId() {
        return targetEmployeeId;
    }

    public void setTargetEmployeeId(UUID targetEmployeeId) {
        this.targetEmployeeId = targetEmployeeId;
    }

    public String getTargetEmployeeEmail() {
        return targetEmployeeEmail;
    }

    public void setTargetEmployeeEmail(String targetEmployeeEmail) {
        this.targetEmployeeEmail = targetEmployeeEmail;
    }

    public String getTargetEmployeeFirstName() {
        return targetEmployeeFirstName;
    }

    public void setTargetEmployeeFirstName(String targetEmployeeFirstName) {
        this.targetEmployeeFirstName = targetEmployeeFirstName;
    }

    public String getTargetEmployeeLastName() {
        return targetEmployeeLastName;
    }

    public void setTargetEmployeeLastName(String targetEmployeeLastName) {
        this.targetEmployeeLastName = targetEmployeeLastName;
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
