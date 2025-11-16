package com.hrms.dto;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Standard error response format for API errors
 * Following RFC 7807 Problem Details pattern
 */
public class ErrorResponse {
    private String error;
    private String message;
    private String requestId;
    private LocalDateTime timestamp;
    private Map<String, String> details;

    public ErrorResponse() {
        this.timestamp = LocalDateTime.now();
    }

    public ErrorResponse(String error, String message) {
        this.error = error;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    public ErrorResponse(String error, String message, String requestId) {
        this.error = error;
        this.message = message;
        this.requestId = requestId;
        this.timestamp = LocalDateTime.now();
    }

    public ErrorResponse(String error, String message, Map<String, String> details) {
        this.error = error;
        this.message = message;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Map<String, String> getDetails() {
        return details;
    }

    public void setDetails(Map<String, String> details) {
        this.details = details;
    }
}
