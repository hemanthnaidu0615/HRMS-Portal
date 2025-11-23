package com.hrms.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Base exception class for all API exceptions
 * Provides consistent error handling across the application
 */
@Getter
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String errorCode;
    private final Object details;

    public ApiException(String message, HttpStatus status, String errorCode) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
        this.details = null;
    }

    public ApiException(String message, HttpStatus status, String errorCode, Object details) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
        this.details = details;
    }

    public ApiException(String message, HttpStatus status, String errorCode, Throwable cause) {
        super(message, cause);
        this.status = status;
        this.errorCode = errorCode;
        this.details = null;
    }
}
