package com.hrms.exception;

import org.springframework.http.HttpStatus;
import java.util.Map;
import java.util.HashMap;

/**
 * Exception for validation failures with field-level details
 */
public class ValidationException extends ApiException {

    public ValidationException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "VALIDATION_FAILED");
    }

    public ValidationException(String message, Map<String, String> fieldErrors) {
        super(message, HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", fieldErrors);
    }

    public ValidationException(String field, String message) {
        super(message, HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", Map.of(field, message));
    }

    // Builder for multiple field errors
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final Map<String, String> errors = new HashMap<>();

        public Builder addError(String field, String message) {
            errors.put(field, message);
            return this;
        }

        public Builder addErrorIf(boolean condition, String field, String message) {
            if (condition) {
                errors.put(field, message);
            }
            return this;
        }

        public boolean hasErrors() {
            return !errors.isEmpty();
        }

        public ValidationException build() {
            return new ValidationException("Validation failed", errors);
        }

        public void throwIfHasErrors() {
            if (hasErrors()) {
                throw build();
            }
        }
    }

    // Pre-defined validation exceptions
    public static ValidationException requiredField(String field) {
        return new ValidationException(field, field + " is required");
    }

    public static ValidationException invalidFormat(String field, String format) {
        return new ValidationException(field, field + " must be in format: " + format);
    }

    public static ValidationException invalidCountryCode(String countryCode) {
        return new ValidationException("countryCode", "Invalid country code: " + countryCode);
    }

    public static ValidationException invalidDocumentNumber(String documentType, String format) {
        return new ValidationException(
            "documentNumber",
            documentType + " number must be in format: " + format
        );
    }
}
