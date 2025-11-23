package com.hrms.validation.validators;

import com.hrms.validation.constraints.ValidEmployeeCode;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

/**
 * Validates employee code format
 */
public class EmployeeCodeValidator implements ConstraintValidator<ValidEmployeeCode, String> {

    private Pattern pattern;
    private int minLength;
    private int maxLength;

    @Override
    public void initialize(ValidEmployeeCode constraintAnnotation) {
        this.pattern = Pattern.compile(constraintAnnotation.pattern());
        this.minLength = constraintAnnotation.minLength();
        this.maxLength = constraintAnnotation.maxLength();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) {
            return true; // Let @NotBlank handle empty values
        }

        String trimmed = value.trim().toUpperCase();

        // Check length
        if (trimmed.length() < minLength) {
            setMessage(context, "Employee code must be at least " + minLength + " characters");
            return false;
        }

        if (trimmed.length() > maxLength) {
            setMessage(context, "Employee code must not exceed " + maxLength + " characters");
            return false;
        }

        // Check pattern
        if (!pattern.matcher(trimmed).matches()) {
            setMessage(context, "Employee code must start with 2-4 letters followed by 4-8 digits (e.g., EMP0001)");
            return false;
        }

        // Check for sequential patterns that are often invalid
        if (isSequentialNumber(trimmed)) {
            setMessage(context, "Employee code cannot be a sequential pattern like 1234");
            return false;
        }

        return true;
    }

    private boolean isSequentialNumber(String code) {
        // Extract the numeric part
        String numericPart = code.replaceAll("[^0-9]", "");
        if (numericPart.length() < 4) return false;

        // Check for obvious patterns
        if (numericPart.equals("0000") || numericPart.equals("1111") ||
                numericPart.equals("1234") || numericPart.equals("4321") ||
                numericPart.equals("9999")) {
            return true;
        }

        return false;
    }

    private void setMessage(ConstraintValidatorContext context, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message).addConstraintViolation();
    }
}
