package com.hrms.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception for business rule violations
 */
public class BusinessException extends ApiException {

    public BusinessException(String message) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY, "BUSINESS_RULE_VIOLATION");
    }

    public BusinessException(String message, String errorCode) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY, errorCode);
    }

    public BusinessException(String message, String errorCode, Object details) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY, errorCode, details);
    }

    // Pre-defined business exceptions
    public static BusinessException employeeAlreadyExists(String email) {
        return new BusinessException(
            "Employee with email '" + email + "' already exists",
            "EMPLOYEE_ALREADY_EXISTS"
        );
    }

    public static BusinessException contractorRequiresVendor() {
        return new BusinessException(
            "Contractors must be associated with a vendor",
            "CONTRACTOR_REQUIRES_VENDOR"
        );
    }

    public static BusinessException invalidDateRange(String message) {
        return new BusinessException(message, "INVALID_DATE_RANGE");
    }

    public static BusinessException documentExpired(String documentType) {
        return new BusinessException(
            "The " + documentType + " document has expired",
            "DOCUMENT_EXPIRED"
        );
    }

    public static BusinessException duplicateDocument(String documentType) {
        return new BusinessException(
            "A " + documentType + " document already exists for this employee",
            "DUPLICATE_DOCUMENT"
        );
    }

    public static BusinessException onboardingNotComplete(String step) {
        return new BusinessException(
            "Onboarding step '" + step + "' is not complete",
            "ONBOARDING_INCOMPLETE"
        );
    }

    public static BusinessException invalidBankRoutingCode(String country) {
        return new BusinessException(
            "Invalid or missing routing code for country: " + country,
            "INVALID_ROUTING_CODE"
        );
    }
}
