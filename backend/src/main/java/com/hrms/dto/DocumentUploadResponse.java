package com.hrms.dto;

public class DocumentUploadResponse {
    private String message;
    private DocumentResponse document;

    public DocumentUploadResponse() {
    }

    public DocumentUploadResponse(String message, DocumentResponse document) {
        this.message = message;
        this.document = document;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public DocumentResponse getDocument() {
        return document;
    }

    public void setDocument(DocumentResponse document) {
        this.document = document;
    }
}
