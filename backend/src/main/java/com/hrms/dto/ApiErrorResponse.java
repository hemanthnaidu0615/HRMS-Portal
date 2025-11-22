package com.hrms.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

/**
 * Standardized API error response
 * Provides consistent error format across all endpoints
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiErrorResponse {

    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String errorCode;
    private String path;
    private String requestId;
    private Map<String, String> fieldErrors;
    private List<String> details;

    // Factory methods for common errors
    public static ApiErrorResponse of(int status, String error, String message, String path) {
        return ApiErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(status)
            .error(error)
            .message(message)
            .path(path)
            .build();
    }

    public static ApiErrorResponse notFound(String resource, String identifier, String path) {
        return ApiErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(404)
            .error("Not Found")
            .errorCode("RESOURCE_NOT_FOUND")
            .message(resource + " not found with identifier: " + identifier)
            .path(path)
            .build();
    }

    public static ApiErrorResponse badRequest(String message, String path) {
        return ApiErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(400)
            .error("Bad Request")
            .errorCode("BAD_REQUEST")
            .message(message)
            .path(path)
            .build();
    }

    public static ApiErrorResponse validationFailed(String message, Map<String, String> fieldErrors, String path) {
        return ApiErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(400)
            .error("Validation Failed")
            .errorCode("VALIDATION_FAILED")
            .message(message)
            .fieldErrors(fieldErrors)
            .path(path)
            .build();
    }

    public static ApiErrorResponse unauthorized(String message, String path) {
        return ApiErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(401)
            .error("Unauthorized")
            .errorCode("UNAUTHORIZED")
            .message(message)
            .path(path)
            .build();
    }

    public static ApiErrorResponse forbidden(String message, String path) {
        return ApiErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(403)
            .error("Forbidden")
            .errorCode("ACCESS_DENIED")
            .message(message)
            .path(path)
            .build();
    }

    public static ApiErrorResponse internalError(String requestId, String path) {
        return ApiErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(500)
            .error("Internal Server Error")
            .errorCode("INTERNAL_ERROR")
            .message("An unexpected error occurred. Please contact support with request ID: " + requestId)
            .requestId(requestId)
            .path(path)
            .build();
    }

    public static ApiErrorResponse businessError(String message, String errorCode, String path) {
        return ApiErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(422)
            .error("Unprocessable Entity")
            .errorCode(errorCode)
            .message(message)
            .path(path)
            .build();
    }

    // Add detail
    public ApiErrorResponse addDetail(String detail) {
        if (this.details == null) {
            this.details = new ArrayList<>();
        }
        this.details.add(detail);
        return this;
    }
}
