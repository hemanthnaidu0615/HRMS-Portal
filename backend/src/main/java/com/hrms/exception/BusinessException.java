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

    public static BusinessException addressTypeExists(String addressType) {
        return new BusinessException(
            "An address of type '" + addressType + "' already exists for this employee",
            "ADDRESS_TYPE_EXISTS"
        );
    }

    public static BusinessException minimumEmergencyContacts() {
        return new BusinessException(
            "At least one emergency contact is required",
            "MINIMUM_EMERGENCY_CONTACTS"
        );
    }

    public static BusinessException documentTypeAlreadyExists(String documentType) {
        return new BusinessException(
            "A '" + documentType + "' document already exists for this employee",
            "DOCUMENT_TYPE_EXISTS"
        );
    }

    public static BusinessException invalidDocumentFormat(String documentType) {
        return new BusinessException(
            "Invalid format for " + documentType,
            "INVALID_DOCUMENT_FORMAT"
        );
    }

    public static BusinessException duplicateBankAccount() {
        return new BusinessException(
            "A bank account with this account number already exists",
            "DUPLICATE_BANK_ACCOUNT"
        );
    }

    public static BusinessException minimumBankAccount() {
        return new BusinessException(
            "At least one active bank account is required for payroll",
            "MINIMUM_BANK_ACCOUNT"
        );
    }

    public static BusinessException workEmailRequired() {
        return new BusinessException(
            "Work email is required for employees",
            "WORK_EMAIL_REQUIRED"
        );
    }

    public static BusinessException invalidEmploymentType(String type) {
        return new BusinessException(
            "Invalid employment type: " + type,
            "INVALID_EMPLOYMENT_TYPE"
        );
    }
}
