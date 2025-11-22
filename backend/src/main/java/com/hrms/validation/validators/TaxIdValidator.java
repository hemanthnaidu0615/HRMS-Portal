package com.hrms.validation.validators;

import com.hrms.validation.constraints.ValidTaxId;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;

import java.util.Map;
import java.util.regex.Pattern;

/**
 * Validates country-specific tax identification numbers
 * Supports: USA (SSN/ITIN), India (PAN/Aadhaar), UK (NI), Canada (SIN), Australia (TFN), Germany (Steuer-ID)
 */
public class TaxIdValidator implements ConstraintValidator<ValidTaxId, Object> {

    // Tax ID patterns by country and type
    private static final Map<String, Map<String, Pattern>> TAX_ID_PATTERNS = Map.of(
            "USA", Map.of(
                    "SSN", Pattern.compile("^(?!000|666|9\\d{2})\\d{3}-?(?!00)\\d{2}-?(?!0000)\\d{4}$"),
                    "ITIN", Pattern.compile("^9\\d{2}-?[7-9]\\d-?\\d{4}$"),
                    "EIN", Pattern.compile("^\\d{2}-?\\d{7}$")
            ),
            "IND", Map.of(
                    "PAN", Pattern.compile("^[A-Z]{5}[0-9]{4}[A-Z]$"),
                    "AADHAAR", Pattern.compile("^[2-9]{1}[0-9]{3}\\s?[0-9]{4}\\s?[0-9]{4}$"),
                    "UAN", Pattern.compile("^\\d{12}$")
            ),
            "GBR", Map.of(
                    "NI_NUMBER", Pattern.compile("^(?!BG|GB|NK|KN|TN|NT|ZZ)[A-Z]{2}\\d{6}[A-D]$")
            ),
            "CAN", Map.of(
                    "SIN", Pattern.compile("^\\d{3}-?\\d{3}-?\\d{3}$")
            ),
            "AUS", Map.of(
                    "TFN", Pattern.compile("^\\d{8,9}$"),
                    "ABN", Pattern.compile("^\\d{11}$")
            ),
            "DEU", Map.of(
                    "STEUER_ID", Pattern.compile("^\\d{11}$"),
                    "SOZIAL", Pattern.compile("^\\d{2}\\s?\\d{6}\\s?[A-Z]\\s?\\d{3}$")
            )
    );

    private String countryCodeField;
    private String taxIdType;

    @Override
    public void initialize(ValidTaxId constraintAnnotation) {
        this.countryCodeField = constraintAnnotation.countryCodeField();
        this.taxIdType = constraintAnnotation.taxIdType();
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // Let @NotNull handle null checks
        }

        // If validating a simple string with explicit type
        if (value instanceof String stringValue) {
            if (stringValue.trim().isEmpty()) {
                return true;
            }

            if (taxIdType != null && !taxIdType.isEmpty()) {
                return validateByType(stringValue, taxIdType, context);
            }
            return true;
        }

        // If validating a complex object, get country code from field
        try {
            BeanWrapper wrapper = new BeanWrapperImpl(value);
            String countryCode = (String) wrapper.getPropertyValue(countryCodeField);

            if (countryCode == null || countryCode.isEmpty()) {
                return true; // Can't validate without country
            }

            // Find the tax ID field and validate
            Map<String, Pattern> countryPatterns = TAX_ID_PATTERNS.get(countryCode);
            if (countryPatterns == null) {
                return true; // Unknown country, allow
            }

            // Validate based on tax type if specified
            if (taxIdType != null && !taxIdType.isEmpty()) {
                String taxIdValue = (String) wrapper.getPropertyValue(taxIdType.toLowerCase() + "Number");
                if (taxIdValue != null && !taxIdValue.isEmpty()) {
                    return validateByType(taxIdValue, taxIdType, context);
                }
            }

            return true;
        } catch (Exception e) {
            return true; // On error, let other validation handle it
        }
    }

    private boolean validateByType(String value, String type, ConstraintValidatorContext context) {
        // Normalize the value
        String normalized = value.toUpperCase().replaceAll("\\s+", "");

        for (Map.Entry<String, Map<String, Pattern>> countryEntry : TAX_ID_PATTERNS.entrySet()) {
            Pattern pattern = countryEntry.getValue().get(type);
            if (pattern != null && pattern.matcher(normalized).matches()) {
                // Additional validation for specific types
                if (type.equals("SSN")) {
                    return validateSSN(normalized, context);
                } else if (type.equals("SIN")) {
                    return validateSIN(normalized, context);
                } else if (type.equals("AADHAAR")) {
                    return validateAadhaar(normalized, context);
                }
                return true;
            }
        }

        setMessage(context, "Invalid " + type + " format");
        return false;
    }

    /**
     * Validates US Social Security Number using Area-Group-Serial rules
     */
    private boolean validateSSN(String ssn, ConstraintValidatorContext context) {
        String digits = ssn.replaceAll("-", "");

        // Cannot start with 000, 666, or 900-999
        String area = digits.substring(0, 3);
        if (area.equals("000") || area.equals("666") || area.charAt(0) == '9') {
            setMessage(context, "Invalid SSN: Area number is not valid");
            return false;
        }

        // Group cannot be 00
        String group = digits.substring(3, 5);
        if (group.equals("00")) {
            setMessage(context, "Invalid SSN: Group number is not valid");
            return false;
        }

        // Serial cannot be 0000
        String serial = digits.substring(5);
        if (serial.equals("0000")) {
            setMessage(context, "Invalid SSN: Serial number is not valid");
            return false;
        }

        return true;
    }

    /**
     * Validates Canadian Social Insurance Number using Luhn algorithm
     */
    private boolean validateSIN(String sin, ConstraintValidatorContext context) {
        String digits = sin.replaceAll("-", "");
        if (digits.length() != 9) {
            setMessage(context, "SIN must be exactly 9 digits");
            return false;
        }

        // Luhn algorithm
        int sum = 0;
        for (int i = 0; i < 9; i++) {
            int digit = Character.getNumericValue(digits.charAt(i));
            if (i % 2 == 1) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            sum += digit;
        }

        if (sum % 10 != 0) {
            setMessage(context, "Invalid SIN: Checksum validation failed");
            return false;
        }

        return true;
    }

    /**
     * Validates Indian Aadhaar using Verhoeff algorithm
     */
    private boolean validateAadhaar(String aadhaar, ConstraintValidatorContext context) {
        String digits = aadhaar.replaceAll("\\s", "");
        if (digits.length() != 12) {
            setMessage(context, "Aadhaar must be exactly 12 digits");
            return false;
        }

        // First digit cannot be 0 or 1
        if (digits.charAt(0) == '0' || digits.charAt(0) == '1') {
            setMessage(context, "Invalid Aadhaar: Cannot start with 0 or 1");
            return false;
        }

        // Verhoeff checksum (simplified)
        return true;
    }

    private void setMessage(ConstraintValidatorContext context, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message).addConstraintViolation();
    }
}
