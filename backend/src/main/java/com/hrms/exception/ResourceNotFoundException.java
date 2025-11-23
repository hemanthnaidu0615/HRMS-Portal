package com.hrms.exception;

/**
 * Exception thrown when a requested resource is not found in the database.
 * This exception is typically mapped to HTTP 404 Not Found response.
 */
public class ResourceNotFoundException extends RuntimeException {

    private String resourceName;
    private String fieldName;
    private Object fieldValue;

    /**
     * Constructor with message only
     * @param message the detail message
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }

    /**
     * Constructor with resource details
     * @param resourceName the name of the resource (e.g., "Employee", "Department")
     * @param fieldName the field used for lookup (e.g., "id", "email")
     * @param fieldValue the value that was not found
     */
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s not found with %s: '%s'", resourceName, fieldName, fieldValue));
        this.resourceName = resourceName;
        this.fieldName = fieldName;
        this.fieldValue = fieldValue;
    }

    /**
     * Constructor with message and cause
     * @param message the detail message
     * @param cause the cause
     */
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    public String getResourceName() {
        return resourceName;
    }

    public String getFieldName() {
        return fieldName;
    }

    public Object getFieldValue() {
        return fieldValue;
    }

    // Factory methods for common resources
    public static ResourceNotFoundException employee(Object id) {
        return new ResourceNotFoundException("Employee", "id", id);
    }

    public static ResourceNotFoundException address(Object id) {
        return new ResourceNotFoundException("Address", "id", id);
    }

    public static ResourceNotFoundException emergencyContact(Object id) {
        return new ResourceNotFoundException("Emergency Contact", "id", id);
    }

    public static ResourceNotFoundException identityDocument(Object id) {
        return new ResourceNotFoundException("Identity Document", "id", id);
    }

    public static ResourceNotFoundException bankAccount(Object id) {
        return new ResourceNotFoundException("Bank Account", "id", id);
    }

    public static ResourceNotFoundException documentType(String code) {
        return new ResourceNotFoundException("Document Type", "code", code);
    }

    public static ResourceNotFoundException organization(Object id) {
        return new ResourceNotFoundException("Organization", "id", id);
    }

    public static ResourceNotFoundException department(Object id) {
        return new ResourceNotFoundException("Department", "id", id);
    }

    public static ResourceNotFoundException user(Object id) {
        return new ResourceNotFoundException("User", "id", id);
    }
}
