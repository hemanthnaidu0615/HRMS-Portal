package com.hrms.exception;

import com.hrms.dto.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Global Exception Handler
 * Provides consistent error responses across all API endpoints
 *
 * Error Response Format:
 * {
 *   "timestamp": "2024-01-15T10:30:00",
 *   "status": 400,
 *   "error": "Bad Request",
 *   "errorCode": "VALIDATION_FAILED",
 *   "message": "Description of what went wrong",
 *   "path": "/api/employees",
 *   "fieldErrors": { "email": "Invalid email format" },  // For validation errors
 *   "requestId": "abc-123"  // For 500 errors, for support reference
 * }
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // =====================================================
    // CUSTOM API EXCEPTIONS
    // =====================================================

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiErrorResponse> handleApiException(ApiException ex, HttpServletRequest request) {
        logger.warn("API exception [{}]: {}", ex.getErrorCode(), ex.getMessage());

        ApiErrorResponse response = ApiErrorResponse.builder()
            .timestamp(java.time.LocalDateTime.now())
            .status(ex.getStatus().value())
            .error(ex.getStatus().getReasonPhrase())
            .errorCode(ex.getErrorCode())
            .message(ex.getMessage())
            .path(request.getRequestURI())
            .build();

        if (ex.getDetails() instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, String> fieldErrors = (Map<String, String>) ex.getDetails();
            response.setFieldErrors(fieldErrors);
        }

        return ResponseEntity.status(ex.getStatus()).body(response);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiErrorResponse> handleBusinessException(BusinessException ex, HttpServletRequest request) {
        logger.warn("Business rule violation [{}]: {}", ex.getErrorCode(), ex.getMessage());

        return ResponseEntity
            .status(HttpStatus.UNPROCESSABLE_ENTITY)
            .body(ApiErrorResponse.businessError(ex.getMessage(), ex.getErrorCode(), request.getRequestURI()));
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationException(ValidationException ex, HttpServletRequest request) {
        logger.warn("Validation failed: {}", ex.getMessage());

        @SuppressWarnings("unchecked")
        Map<String, String> fieldErrors = ex.getDetails() instanceof Map
            ? (Map<String, String>) ex.getDetails()
            : null;

        return ResponseEntity
            .badRequest()
            .body(ApiErrorResponse.validationFailed(ex.getMessage(), fieldErrors, request.getRequestURI()));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex, HttpServletRequest request) {
        logger.warn("Resource not found: {}", ex.getMessage());

        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(ApiErrorResponse.notFound("Resource", ex.getMessage(), request.getRequestURI()));
    }

    // =====================================================
    // SPRING VALIDATION EXCEPTIONS
    // =====================================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> fieldErrors = new HashMap<>();

        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            fieldErrors.put(fieldName, errorMessage);
        });

        logger.warn("Validation failed for {} fields: {}", fieldErrors.size(), fieldErrors);

        return ResponseEntity
            .badRequest()
            .body(ApiErrorResponse.validationFailed("Validation failed for " + fieldErrors.size() + " field(s)", fieldErrors, request.getRequestURI()));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiErrorResponse> handleMissingParams(MissingServletRequestParameterException ex, HttpServletRequest request) {
        logger.warn("Missing request parameter: {}", ex.getParameterName());

        return ResponseEntity
            .badRequest()
            .body(ApiErrorResponse.badRequest("Missing required parameter: " + ex.getParameterName(), request.getRequestURI()));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        String message = String.format("Parameter '%s' should be of type %s",
            ex.getName(),
            ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown");

        logger.warn("Type mismatch: {}", message);

        return ResponseEntity
            .badRequest()
            .body(ApiErrorResponse.badRequest(message, request.getRequestURI()));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleMessageNotReadable(HttpMessageNotReadableException ex, HttpServletRequest request) {
        logger.warn("Malformed JSON request: {}", ex.getMessage());

        return ResponseEntity
            .badRequest()
            .body(ApiErrorResponse.badRequest("Malformed JSON request body", request.getRequestURI()));
    }

    // =====================================================
    // SECURITY EXCEPTIONS
    // =====================================================

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDeniedException(AccessDeniedException ex, HttpServletRequest request) {
        logger.warn("Access denied for path {}: {}", request.getRequestURI(), ex.getMessage());

        return ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body(ApiErrorResponse.forbidden("You do not have permission to perform this action", request.getRequestURI()));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiErrorResponse> handleAuthenticationException(AuthenticationException ex, HttpServletRequest request) {
        logger.warn("Authentication failed: {}", ex.getMessage());

        return ResponseEntity
            .status(HttpStatus.UNAUTHORIZED)
            .body(ApiErrorResponse.unauthorized("Authentication failed: " + ex.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> handleBadCredentials(BadCredentialsException ex, HttpServletRequest request) {
        logger.warn("Bad credentials for path: {}", request.getRequestURI());

        return ResponseEntity
            .status(HttpStatus.UNAUTHORIZED)
            .body(ApiErrorResponse.unauthorized("Invalid username or password", request.getRequestURI()));
    }

    // =====================================================
    // HTTP EXCEPTIONS
    // =====================================================

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiErrorResponse> handleMethodNotAllowed(HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {
        logger.warn("Method not allowed: {} for {}", ex.getMethod(), request.getRequestURI());

        ApiErrorResponse response = ApiErrorResponse.builder()
            .timestamp(java.time.LocalDateTime.now())
            .status(405)
            .error("Method Not Allowed")
            .errorCode("METHOD_NOT_ALLOWED")
            .message("HTTP method " + ex.getMethod() + " is not supported for this endpoint")
            .path(request.getRequestURI())
            .build();

        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(response);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiErrorResponse> handleMediaTypeNotSupported(HttpMediaTypeNotSupportedException ex, HttpServletRequest request) {
        logger.warn("Media type not supported: {}", ex.getContentType());

        ApiErrorResponse response = ApiErrorResponse.builder()
            .timestamp(java.time.LocalDateTime.now())
            .status(415)
            .error("Unsupported Media Type")
            .errorCode("UNSUPPORTED_MEDIA_TYPE")
            .message("Content-Type " + ex.getContentType() + " is not supported")
            .path(request.getRequestURI())
            .build();

        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body(response);
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNoHandlerFound(NoHandlerFoundException ex, HttpServletRequest request) {
        logger.warn("No handler found: {} {}", ex.getHttpMethod(), ex.getRequestURL());

        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(ApiErrorResponse.notFound("Endpoint", ex.getRequestURL(), request.getRequestURI()));
    }

    // =====================================================
    // DATABASE EXCEPTIONS
    // =====================================================

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex, HttpServletRequest request) {
        logger.error("Data integrity violation: {}", ex.getMessage());

        String message = "Data integrity violation";
        String errorCode = "DATA_INTEGRITY_ERROR";

        // Parse common constraint violations
        String exMessage = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";
        if (exMessage.contains("unique") || exMessage.contains("duplicate")) {
            message = "A record with this value already exists";
            errorCode = "DUPLICATE_ENTRY";
        } else if (exMessage.contains("foreign key") || exMessage.contains("reference")) {
            message = "Cannot delete or modify this record because it is referenced by other records";
            errorCode = "REFERENCE_CONSTRAINT";
        } else if (exMessage.contains("not null") || exMessage.contains("null")) {
            message = "A required field is missing";
            errorCode = "NULL_CONSTRAINT";
        }

        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(ApiErrorResponse.builder()
                .timestamp(java.time.LocalDateTime.now())
                .status(409)
                .error("Conflict")
                .errorCode(errorCode)
                .message(message)
                .path(request.getRequestURI())
                .build());
    }

    // =====================================================
    // GENERIC EXCEPTIONS (Catch-all)
    // =====================================================

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex, HttpServletRequest request) {
        logger.warn("Illegal argument: {}", ex.getMessage());

        return ResponseEntity
            .badRequest()
            .body(ApiErrorResponse.badRequest(ex.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGenericException(Exception ex, HttpServletRequest request) {
        // Generate unique request ID for tracking
        String requestId = UUID.randomUUID().toString().substring(0, 8);

        // Log full stack trace for debugging
        logger.error("Unhandled exception [requestId: {}] at {}: {}",
            requestId, request.getRequestURI(), ex.getMessage(), ex);

        // Don't expose internal error details to clients (security)
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiErrorResponse.internalError(requestId, request.getRequestURI()));
    }
}
