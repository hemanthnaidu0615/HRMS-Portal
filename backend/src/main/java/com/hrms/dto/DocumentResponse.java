package com.hrms.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class DocumentResponse {
    private UUID id;
    private UUID employeeId;
    private UUID uploadedByUserId;
    private String fileName;
    private String filePath;
    private String fileType;
    private LocalDateTime createdAt;

    public DocumentResponse() {
    }

    public DocumentResponse(UUID id, UUID employeeId, UUID uploadedByUserId, String fileName, String filePath, String fileType, LocalDateTime createdAt) {
        this.id = id;
        this.employeeId = employeeId;
        this.uploadedByUserId = uploadedByUserId;
        this.fileName = fileName;
        this.filePath = filePath;
        this.fileType = fileType;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(UUID employeeId) {
        this.employeeId = employeeId;
    }

    public UUID getUploadedByUserId() {
        return uploadedByUserId;
    }

    public void setUploadedByUserId(UUID uploadedByUserId) {
        this.uploadedByUserId = uploadedByUserId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
